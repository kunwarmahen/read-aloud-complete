"""
Authentication routes - register, login
"""
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
from models import UserCreate, UserLogin, Token, UserResponse
from auth import get_password_hash, verify_password, create_access_token
from database import get_collection
from config import settings
from datetime import datetime
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user_id,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register a new user"""
    users = get_collection("users")
    
    # Check if user already exists
    existing_user = await users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_doc = {
        "email": user.email,
        "password_hash": get_password_hash(user.password),
        "name": user.name,
        "created_at": datetime.utcnow()
    }
    
    result = await users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    return UserResponse(
        id=str(user_doc["_id"]),
        email=user_doc["email"],
        name=user_doc.get("name"),
        created_at=user_doc["created_at"]
    )


@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    """Login and get access token"""
    users = get_collection("users")
    
    # Find user
    db_user = await users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(user_id: str = Depends(get_current_user_id)):
    """Get current user information"""
    from auth import get_current_user_id
    from fastapi import Depends
    from bson import ObjectId
    
    users = get_collection("users")
    user = await users.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user.get("name"),
        created_at=user["created_at"]
    )
