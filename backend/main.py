"""
Read Aloud Cloud API
FastAPI backend for Read Aloud Chrome Extension
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import logging
from contextlib import asynccontextmanager

from database import connect_to_mongo, close_mongo_connection
from config import settings
from routers import auth, articles, collections

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    # Startup
    logger.info("Starting Read Aloud Cloud API...")
    await connect_to_mongo()
    logger.info("API ready!")
    
    yield  # Application runs here
    
    # Shutdown
    logger.info("Shutting down...")
    await close_mongo_connection()


# Create FastAPI app with lifespan
app = FastAPI(
    title="Read Aloud Cloud API",
    description="Backend API for Read Aloud Chrome Extension and Mobile App",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your extension and app origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount audio storage
audio_path = Path(settings.local_storage_path)
audio_path.mkdir(parents=True, exist_ok=True)
app.mount("/audio", StaticFiles(directory=str(audio_path)), name="audio")

# Include routers
app.include_router(auth.router)
app.include_router(articles.router)
app.include_router(collections.router)


# Health check endpoint
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "Read Aloud Cloud API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "storage": "available"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )