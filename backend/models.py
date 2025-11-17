"""
Pydantic models for API requests and responses
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


# Article Models
class ArticleCreate(BaseModel):
    title: str
    content: str
    source_url: Optional[str] = None
    collection_id: Optional[str] = None


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    play_position_seconds: Optional[int] = None
    last_played_at: Optional[datetime] = None


class ArticleResponse(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    source_url: Optional[str] = None
    audio_url: Optional[str] = None
    duration_seconds: Optional[int] = None
    play_position_seconds: int = 0
    created_at: datetime
    last_played_at: Optional[datetime] = None
    collection_id: Optional[str] = None


# Collection Models
class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None


class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CollectionResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    article_count: int = 0
    created_at: datetime


# Audio Generation
class AudioGenerateRequest(BaseModel):
    article_id: str


class AudioGenerateResponse(BaseModel):
    audio_url: str
    duration_seconds: int
