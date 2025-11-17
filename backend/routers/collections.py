"""
Collection routes - organize articles into collections/playlists
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models import CollectionCreate, CollectionResponse, CollectionUpdate
from auth import get_current_user_id
from database import get_collection  # ✅ Import the helper function
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/collections", tags=["Collections"])


@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    collection: CollectionCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new collection"""
    # ✅ FIX: Use imported get_collection function
    collections_col = get_collection("collections")
    
    collection_doc = {
        "user_id": ObjectId(user_id),
        "name": collection.name,
        "description": collection.description,
        "created_at": datetime.utcnow()
    }
    
    # ✅ FIX: Await the insert operation
    result = await collections_col.insert_one(collection_doc)
    
    return CollectionResponse(
        id=str(result.inserted_id),
        user_id=user_id,
        name=collection.name,
        description=collection.description,
        article_count=0,
        created_at=collection_doc["created_at"]
    )


@router.get("", response_model=List[CollectionResponse])
async def list_collections(user_id: str = Depends(get_current_user_id)):
    """List user's collections"""
    # ✅ FIX: Use imported get_collection function with different variable name
    collections_col = get_collection("collections")
    articles_col = get_collection("articles")
    
    # ✅ FIX: Create cursor from async find
    cursor = collections_col.find({"user_id": ObjectId(user_id)}).sort("created_at", -1)
    results = []
    
    # ✅ FIX: Iterate through cursor properly
    async for doc in cursor:
        # Count articles in this collection
        article_count = await articles_col.count_documents({
            "user_id": ObjectId(user_id),
            "collection_id": doc["_id"]
        })
        
        results.append(CollectionResponse(
            id=str(doc["_id"]),
            user_id=str(doc["user_id"]),
            name=doc["name"],
            description=doc.get("description"),
            article_count=article_count,
            created_at=doc["created_at"]
        ))
    
    return results


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection_details(  # ✅ FIX: Renamed from get_collection to avoid name collision
    collection_id: str, 
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific collection"""
    # ✅ FIX: Use imported get_collection function with different variable name
    collections_col = get_collection("collections")
    articles_col = get_collection("articles")
    
    # ✅ FIX: Await the find_one operation
    coll = await collections_col.find_one({
        "_id": ObjectId(collection_id),
        "user_id": ObjectId(user_id)
    })
    
    if not coll:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    # Count articles
    article_count = await articles_col.count_documents({
        "user_id": ObjectId(user_id),
        "collection_id": ObjectId(collection_id)
    })
    
    return CollectionResponse(
        id=str(coll["_id"]),
        user_id=str(coll["user_id"]),
        name=coll["name"],
        description=coll.get("description"),
        article_count=article_count,
        created_at=coll["created_at"]
    )


@router.patch("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: str,
    update: CollectionUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a collection"""
    # ✅ FIX: Use imported get_collection function with different variable name
    collections_col = get_collection("collections")
    
    update_data = {}
    if update.name is not None:
        update_data["name"] = update.name
    if update.description is not None:
        update_data["description"] = update.description
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # ✅ FIX: Await the update operation
    result = await collections_col.update_one(
        {"_id": ObjectId(collection_id), "user_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    # ✅ FIX: Call the renamed function
    return await get_collection_details(collection_id, user_id)


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(
    collection_id: str, 
    user_id: str = Depends(get_current_user_id)
):
    """Delete a collection (articles remain but lose collection reference)"""
    # ✅ FIX: Use imported get_collection function with different variable name
    collections_col = get_collection("collections")
    articles_col = get_collection("articles")
    
    # ✅ FIX: Await the update operation
    # Remove collection reference from articles
    await articles_col.update_many(
        {"collection_id": ObjectId(collection_id)},
        {"$set": {"collection_id": None}}
    )
    
    # ✅ FIX: Await the delete operation
    # Delete collection
    result = await collections_col.delete_one({
        "_id": ObjectId(collection_id),
        "user_id": ObjectId(user_id)
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    return None