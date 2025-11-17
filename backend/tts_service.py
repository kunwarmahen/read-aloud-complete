"""
Text-to-Speech service - integrates with your existing TTS server
"""
import aiohttp
import os
from pathlib import Path
from config import settings
import logging
from pydub import AudioSegment
import io

logger = logging.getLogger(__name__)


class TTSService:
    """Service for generating audio from text"""
    
    def __init__(self):
        self.tts_url = settings.tts_server_url
        self.storage_path = Path(settings.local_storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
    
    async def generate_audio(self, text: str, article_id: str) -> tuple[str, int]:
        """
        Generate audio from text using TTS server
        Returns: (audio_file_path, duration_in_seconds)
        """
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.tts_url}/synthesize",
                    json={"text": text, "rate": 1.0}
                ) as response:
                    if response.status != 200:
                        raise Exception(f"TTS server error: {response.status}")
                    
                    audio_data = await response.read()
                    
                    # Save audio file
                    audio_filename = f"{article_id}.wav"
                    audio_path = self.storage_path / audio_filename
                    
                    with open(audio_path, 'wb') as f:
                        f.write(audio_data)
                    
                    # Calculate duration
                    duration = self._get_audio_duration(audio_path)
                    
                    logger.info(f"Generated audio for article {article_id}, duration: {duration}s")
                    
                    return str(audio_path), duration
        
        except Exception as e:
            logger.error(f"Error generating audio: {e}")
            raise
    
    def _get_audio_duration(self, audio_path: Path) -> int:
        """Get audio duration in seconds"""
        try:
            audio = AudioSegment.from_wav(str(audio_path))
            return int(audio.duration_seconds)
        except Exception as e:
            logger.error(f"Error getting audio duration: {e}")
            return 0
    
    def get_audio_url(self, article_id: str) -> str:
        """Get URL for audio file"""
        # For local storage, return relative path
        # In production, this would be an S3 URL or CDN URL
        return f"/audio/{article_id}.wav"
    
    def delete_audio(self, article_id: str):
        """Delete audio file"""
        try:
            audio_path = self.storage_path / f"{article_id}.wav"
            if audio_path.exists():
                audio_path.unlink()
                logger.info(f"Deleted audio for article {article_id}")
        except Exception as e:
            logger.error(f"Error deleting audio: {e}")


tts_service = TTSService()
