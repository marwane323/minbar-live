import pytest
from fastapi.testclient import TestClient
import json
from app.main import app
from app.schemas import ASRConfig
from app.dialect import detect_dialect
from app.audio import chunk_audio

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "active_sessions" in response.json()

def test_schema_validation():
    config = ASRConfig(model="whisper-v3-turbo")
    assert config.language == "ar"
    assert config.model == "whisper-v3-turbo"

    with pytest.raises(ValueError):
        ASRConfig(enable_timestamps="not_a_bool")

def test_dialect_detection():
    # Egyptian
    dialect, conf = detect_dialect("ازيك عامل ايه دلوقتي")
    assert dialect == "Egyptian"
    
    # Levantine
    dialect, conf = detect_dialect("كيفك شو هلق بدي")
    assert dialect == "Levantine"
    
    # MSA (default fallback)
    dialect, conf = detect_dialect("السلام عليكم")
    assert dialect == "MSA"

def test_audio_chunking():
    # Create 1 second of dummy 16-bit PCM audio (16000 hz = 32000 bytes)
    dummy_audio = b"\x00" * 32000
    
    # Chunk into 500ms
    chunks = chunk_audio(dummy_audio, chunk_duration_ms=500, sample_rate=16000)
    
    assert len(chunks) == 2
    assert len(chunks[0]) == 16000

def test_websocket_endpoint():
    with client.websocket_connect("/ws/transcribe") as websocket:
        # Send config
        config = {"model": "cohere-arabic", "language": "ar"}
        websocket.send_text(json.dumps(config))
        
        # Send dummy audio
        dummy_audio = b"\x00\x01" * 1600 # 3200 bytes
        websocket.send_bytes(dummy_audio)
        
        # Receive response
        response = websocket.receive_text()
        event = json.loads(response)
        
        assert "event_type" in event
        assert event["event_type"] == "final"
        assert event["segment"]["text"] == "السلام عليكم ورحمة الله وبركاته"

def test_transcribe_rest_endpoint():
    dummy_audio = b"\x00\x01" * 1600
    response = client.post(
        "/api/transcribe",
        files={"file": ("test.wav", dummy_audio, "audio/wav")},
        data={"config": json.dumps({"model": "whisper-v3-turbo"})}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["segments"]) > 0
    assert "أهلاً" in data["segments"][0]["text"]
