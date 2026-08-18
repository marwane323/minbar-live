import pytest
import base64
from fastapi.testclient import TestClient
from app.main import app
from app.audio_utils import generate_sine_wave, generate_silence, estimate_speech_duration

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "tts_service"}

def test_audio_utils():
    # Test sine wave generation
    sine = generate_sine_wave(1000) # 1 second
    assert len(sine) > 0
    assert sine.startswith(b'RIFF') # WAV header
    
    # Test silence generation
    silence = generate_silence(500) # 0.5 seconds
    assert len(silence) > 0
    assert silence.startswith(b'RIFF')
    
    # Test duration estimation
    text = "Hello world, this is a test"
    duration = estimate_speech_duration(text, "en")
    assert duration > 0

@pytest.mark.asyncio
async def test_create_voice_profile():
    payload = {
        "imam_id": "imam_123",
        "tenant_id": "tenant_1",
        "audio_sample_url": "https://example.com/sample.wav"
    }
    response = client.post("/api/voice/profile", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "voice_id" in data
    assert data["status"] == "ready"
    
    # Get the profile
    voice_id = data["voice_id"]
    response = client.get(f"/api/voice/profile/{voice_id}")
    assert response.status_code == 200
    assert response.json()["voice_id"] == voice_id

def test_synthesize_audio():
    payload = {
        "text": "Bismillah ar-Rahman ar-Rahim",
        "language": "ar",
        "voice_id": "mock_voice_id"
    }
    response = client.post("/api/tts/synthesize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "audio_bytes" in data
    assert data["duration_ms"] > 0
    
    # Verify the audio bytes decode successfully
    audio_data = base64.b64decode(data["audio_bytes"])
    assert len(audio_data) > 0
    assert audio_data.startswith(b'RIFF')

def test_batch_synthesize():
    payload = {
        "voice_id": "mock_voice_id",
        "segments": [
            {"text": "Hello", "language": "en"},
            {"text": "World", "language": "en"}
        ]
    }
    response = client.post("/api/tts/batch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "audio_urls" in data
    assert len(data["audio_urls"]) == 2

def test_pregeneration():
    payload = {
        "voice_id": "mock_voice_id",
        "segments": [
            {"text": "Segment 1", "language": "en"}
        ]
    }
    # Start pregeneration
    response = client.post("/api/tts/pregenerate?script_id=script_123", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "job_id" in data
    
    job_id = data["job_id"]
    
    # Get status
    response = client.get(f"/api/tts/pregenerate/{job_id}")
    assert response.status_code == 200
    status_data = response.json()
    assert status_data["status"] in ["queued", "processing", "completed"]
