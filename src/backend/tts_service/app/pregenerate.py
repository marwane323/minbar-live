import uuid
import asyncio
from typing import Dict, List
from .schemas import BatchSegment, TTSConfig
from .engine import ChatterboxEngine

class PreGenerationManager:
    def __init__(self):
        self._jobs: Dict[str, dict] = {}
        self._engine = ChatterboxEngine()

    async def _process_job(self, job_id: str, segments: List[BatchSegment], voice_id: str):
        self._jobs[job_id]["status"] = "processing"
        audio_urls = []
        
        config = TTSConfig(voice_id=voice_id, language="en") # Default language
        
        for i, segment in enumerate(segments):
            config.language = segment.language
            # Mock synthesis process
            await asyncio.sleep(0.1) # simulate work
            # In real system, upload bytes to S3 and get URL
            audio_url = f"https://mock-storage.com/audio/{job_id}_{i}.wav"
            audio_urls.append(audio_url)
            self._jobs[job_id]["progress"] = (i + 1) / len(segments)
            
        self._jobs[job_id]["status"] = "completed"
        self._jobs[job_id]["result"] = audio_urls

    def queue_pregeneration(self, script_id: str, segments: List[BatchSegment], voice_id: str) -> str:
        job_id = str(uuid.uuid4())
        self._jobs[job_id] = {
            "script_id": script_id,
            "status": "queued",
            "progress": 0.0,
            "result": None
        }
        
        # Start background task
        asyncio.create_task(self._process_job(job_id, segments, voice_id))
        
        return job_id

    def get_job_status(self, job_id: str) -> dict:
        job = self._jobs.get(job_id)
        if not job:
            return {"status": "not_found"}
        return {
            "status": job["status"],
            "progress": job["progress"],
            "result": job["result"]
        }

# Singleton instance
pregeneration_manager = PreGenerationManager()
