from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class TTSConfig(BaseModel):
    voice_id: str
    language: str
    speed: float = 1.0
    pitch: float = 1.0
    output_format: str = Field("wav", description="wav, mp3, or ogg")

class TTSRequest(BaseModel):
    text: str
    language: str
    voice_id: str
    config: Optional[TTSConfig] = None

class TTSResponse(BaseModel):
    audio_url: Optional[str] = None
    audio_bytes: Optional[str] = None # Base64 encoded if returned directly
    duration_ms: int
    sample_rate: int

class VoiceProfileRequest(BaseModel):
    imam_id: str
    tenant_id: str
    audio_sample_url: str

class VoiceProfileResponse(BaseModel):
    voice_id: str
    status: str
    quality_score: float

class BatchSegment(BaseModel):
    text: str
    language: str

class BatchTTSRequest(BaseModel):
    voice_id: str
    segments: List[BatchSegment]
    config: Optional[TTSConfig] = None

class BatchTTSResponse(BaseModel):
    audio_urls: List[str]
