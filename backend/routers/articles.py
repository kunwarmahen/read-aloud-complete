"""
Article routes - CRUD operations for saved articles
"""
from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from typing import List
from models import ArticleCreate, ArticleResponse, ArticleUpdate
from auth import get_current_user_id
from database import get_collection
from bson import ObjectId
from datetime import datetime
from tts_service import tts_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/articles", tags=["Articles"])


async def create_default_collection(user_id: str) -> ObjectId:
    """
    Create or retrieve the default 'Saved Articles' collection for a user.
    
    ✅ FIX: Ensures every article has a collection, even if none specified
    """
    collections = get_collection("collections")
    
    try:
        # Try to find existing default collection
        existing = await collections.find_one({
            "user_id": ObjectId(user_id),
            "name": "Saved Articles"
        })
        
        if existing:
            logger.info(f"Using existing default collection for user {user_id}")
            return existing["_id"]
        
        # Create new default collection
        result = await collections.insert_one({
            "user_id": ObjectId(user_id),
            "name": "Saved Articles",
            "description": "Your default collection for saved articles",
            "created_at": datetime.utcnow()
        })
        
        logger.info(f"Created default collection {result.inserted_id} for user {user_id}")
        return result.inserted_id
    
    except Exception as e:
        logger.error(f"Error creating/retrieving default collection: {e}")
        raise


@router.post("", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    article: ArticleCreate,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id)
):
    """
    Save a new article with proper collection handling.
    
    ✅ FIXED LOGIC:
    1. If collection_id provided and valid, use it
    2. If collection_id invalid/doesn't exist, create default
    3. If no collection_id provided, create/use default
    4. Always ensure article has a collection_id (never None in DB)
    """
    articles = get_collection("articles")
    collections = get_collection("collections")
    
    article_doc = {
        "user_id": ObjectId(user_id),
        "title": article.title,
        "content": article.content,
        "source_url": article.source_url,
        "audio_url": None,
        "duration_seconds": None,
        "play_position_seconds": 0,
        "created_at": datetime.utcnow(),
        "last_played_at": None,
        "collection_id": None  # Will be set below
    }
    
    # ✅ FIX: Handle collection_id with multiple checks
    if article.collection_id and article.collection_id.strip():  # Non-empty string
        try:
            # Validate that ObjectId is valid format
            collection_obj_id = ObjectId(article.collection_id)
            
            # Check if collection exists and belongs to user
            collection_obj = await collections.find_one({
                "_id": collection_obj_id,
                "user_id": ObjectId(user_id)
            })
            
            if collection_obj:
                # ✅ Collection exists and belongs to user
                article_doc["collection_id"] = collection_obj_id
                logger.info(f"Article assigned to collection {article.collection_id}")
            else:
                # ✅ Collection doesn't exist or belongs to different user
                # Create/use default collection instead
                logger.warning(f"Collection {article.collection_id} not found for user, using default")
                article_doc["collection_id"] = await create_default_collection(user_id)
        
        except Exception as e:
            # ✅ Invalid ObjectId format or other error
            logger.warning(f"Invalid collection_id format: {e}, using default")
            article_doc["collection_id"] = await create_default_collection(user_id)
    
    else:
        # ✅ No collection specified (None or empty string)
        # Create or retrieve default collection
        article_doc["collection_id"] = await create_default_collection(user_id)
    
    # ✅ VALIDATION: Ensure collection_id is set
    if not article_doc["collection_id"]:
        raise HTTPException(
            status_code=500,
            detail="Failed to assign collection to article"
        )
    
    result = await articles.insert_one(article_doc)
    article_id = str(result.inserted_id)
    
    # Generate audio in background
    background_tasks.add_task(generate_audio_task, article_id, article.content)
    
    return ArticleResponse(
        id=article_id,
        user_id=user_id,
        title=article.title,
        content=article.content,
        source_url=article.source_url,
        audio_url=None,
        duration_seconds=None,
        created_at=article_doc["created_at"],
        collection_id=str(article_doc["collection_id"])
    )


async def generate_audio_task(article_id: str, content: str):
    """Background task to generate audio"""
    try:
        audio_path, duration = await tts_service.generate_audio(content, article_id)
        audio_url = tts_service.get_audio_url(article_id)
        
        # Update article with audio info
        articles = get_collection("articles")
        await articles.update_one(
            {"_id": ObjectId(article_id)},
            {"$set": {
                "audio_url": audio_url,
                "duration_seconds": duration
            }}
        )
        logger.info(f"Audio generated for article {article_id}")
    except Exception as e:
        logger.error(f"Failed to generate audio for article {article_id}: {e}")


@router.get("", response_model=List[ArticleResponse])
async def list_articles(
    skip: int = 0,
    limit: int = 50,
    collection_id: str = None,
    user_id: str = Depends(get_current_user_id)
):
    """List user's saved articles"""
    articles = get_collection("articles")
    
    query = {"user_id": ObjectId(user_id)}
    if collection_id:
        query["collection_id"] = ObjectId(collection_id)
    
    cursor = articles.find(query).sort("created_at", -1).skip(skip).limit(limit)
    results = []
    
    async for doc in cursor:
        results.append(ArticleResponse(
            id=str(doc["_id"]),
            user_id=str(doc["user_id"]),
            title=doc["title"],
            content=doc["content"],
            source_url=doc.get("source_url"),
            audio_url=doc.get("audio_url"),
            duration_seconds=doc.get("duration_seconds"),
            play_position_seconds=doc.get("play_position_seconds", 0),
            created_at=doc["created_at"],
            last_played_at=doc.get("last_played_at"),
            collection_id=str(doc["collection_id"]) if doc.get("collection_id") else None
        ))
    
    return results


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: str, user_id: str = Depends(get_current_user_id)):
    """Get a specific article"""
    articles = get_collection("articles")
    
    article = await articles.find_one({
        "_id": ObjectId(article_id),
        "user_id": ObjectId(user_id)
    })
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return ArticleResponse(
        id=str(article["_id"]),
        user_id=str(article["user_id"]),
        title=article["title"],
        content=article["content"],
        source_url=article.get("source_url"),
        audio_url=article.get("audio_url"),
        duration_seconds=article.get("duration_seconds"),
        play_position_seconds=article.get("play_position_seconds", 0),
        created_at=article["created_at"],
        last_played_at=article.get("last_played_at"),
        collection_id=str(article["collection_id"]) if article.get("collection_id") else None
    )


@router.patch("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    update: ArticleUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update article (e.g., play position)"""
    articles = get_collection("articles")
    
    update_data = {}
    if update.title is not None:
        update_data["title"] = update.title
    if update.play_position_seconds is not None:
        update_data["play_position_seconds"] = update.play_position_seconds
    if update.last_played_at is not None:
        update_data["last_played_at"] = update.last_played_at
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await articles.update_one(
        {"_id": ObjectId(article_id), "user_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Return updated article
    return await get_article(article_id, user_id)


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(article_id: str, user_id: str = Depends(get_current_user_id)):
    """Delete an article"""
    articles = get_collection("articles")
    
    result = await articles.delete_one({
        "_id": ObjectId(article_id),
        "user_id": ObjectId(user_id)
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Delete audio file
    tts_service.delete_audio(article_id)
    
    return None