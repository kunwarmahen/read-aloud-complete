"""
Configuration settings for Read Aloud Cloud API
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "readaloud"
    
    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # TTS
    tts_server_url: str = "http://localhost:5000"
    
    # Storage
    storage_type: str = "local"  # 'local' or 's3'
    local_storage_path: str = "./audio_storage"
    
    # AWS S3 (optional)
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    s3_bucket_name: Optional[str] = None
    aws_region: str = "us-east-1"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_file = ".env"


settings = Settings()
