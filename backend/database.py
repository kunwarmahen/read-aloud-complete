"""
MongoDB database connection and utilities
"""
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import logging

logger = logging.getLogger(__name__)


class MongoDB:
    client: AsyncIOMotorClient = None
    
    
mongodb = MongoDB()


async def connect_to_mongo():
    """Connect to MongoDB"""
    logger.info("Connecting to MongoDB...")
    mongodb.client = AsyncIOMotorClient(settings.mongodb_url)
    logger.info("Connected to MongoDB!")


async def close_mongo_connection():
    """Close MongoDB connection"""
    logger.info("Closing MongoDB connection...")
    mongodb.client.close()
    logger.info("MongoDB connection closed!")


def get_database():
    """Get database instance"""
    return mongodb.client[settings.database_name]


def get_collection(collection_name: str):
    """Get collection from database"""
    db = get_database()
    return db[collection_name]
