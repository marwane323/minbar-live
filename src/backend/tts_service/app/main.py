from fastapi import FastAPI, HTTPException, BackgroundTasks
from shared.logging import setup_logging
from shared.config import settings
import base64

from .schemas import (
    TTSRequest, TTSResponse, VoiceProfileRequest, VoiceProfileResponse,
    BatchTTSRequest, BatchTTSResponse
)
from .engine import ChatterboxEngine
from .voice_profile import voice_profile_manager
from .pregenerate import pregeneration_manager
from .audio_utils import estimate_speech_duration

setup_logging()

app = FastAPI(title=settings.SERVICE_NAME or "tts_service")
engine = ChatterboxEngine()

@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok", "service": "tts_service"}

@app.post("/api/tts/synthesize", response_model=TTSResponse)
async def synthesize_audio(request: TTSRequest):
    profile = voice_profile_manager.get_profile(request.voice_id)
    if not profile:
        profile = {"voice_id": request.voice_id} # mock profile for now
        
    config = request.config
    if not config:
        from .schemas import TTSConfig
        config = TTSConfig(voice_id=request.voice_id, language=request.language)
        
    audio_bytes = await engine.synthesize(request.text, profile, config)
    duration_ms = int(estimate_speech_duration(request.text, request.language))
    
    return TTSResponse(
        audio_bytes=base64.b64encode(audio_bytes).decode('utf-8'),
        duration_ms=duration_ms,
        sample_rate=24000
    )

@app.post("/api/tts/batch", response_model=BatchTTSResponse)
async def batch_synthesize(request: BatchTTSRequest):
    # In a real scenario, this might trigger a pregeneration job or process sequentially
    job_id = pregeneration_manager.queue_pregeneration(
        script_id="batch_request", 
        segments=request.segments, 
        voice_id=request.voice_id
    )
    # Simulate waiting for the job for synchronous response (or just returning job_id in async architecture)
    # For this mock, return mock urls directly
    audio_urls = [f"https://mock-storage.com/audio/batch_{i}.wav" for i in range(len(request.segments))]
    return BatchTTSResponse(audio_urls=audio_urls)

@app.post("/api/voice/profile", response_model=VoiceProfileResponse)
async def create_voice_profile(request: VoiceProfileRequest):
    profile = await voice_profile_manager.create_profile(
        request.audio_sample_url, request.imam_id, request.tenant_id
    )
    return VoiceProfileResponse(**profile)

@app.get("/api/voice/profile/{voice_id}", response_model=VoiceProfileResponse)
async def get_voice_profile(voice_id: str):
    profile = voice_profile_manager.get_profile(voice_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return VoiceProfileResponse(**profile)

@app.post("/api/tts/pregenerate")
async def start_pregeneration(script_id: str, request: BatchTTSRequest):
    job_id = pregeneration_manager.queue_pregeneration(
        script_id=script_id,
        segments=request.segments,
        voice_id=request.voice_id
    )
    return {"job_id": job_id, "status": "queued"}

@app.get("/api/tts/pregenerate/{job_id}")
async def get_pregeneration_status(job_id: str):
    status = pregeneration_manager.get_job_status(job_id)
    if status["status"] == "not_found":
        raise HTTPException(status_code=404, detail="Job not found")
    return status
