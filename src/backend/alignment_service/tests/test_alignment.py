import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas import AlignmentConfig
from app.engine import AlignmentEngine
from app.normalizer import ArabicNormalizer
from app.session import session_store

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "alignment_service"}

def test_arabic_normalizer():
    # Test specific normalization rules
    assert ArabicNormalizer.normalize("إأآٱ") == "اااا"
    assert ArabicNormalizer.normalize("مدرسة") == "مدرسه"
    assert ArabicNormalizer.normalize("هدى") == "هدي"
    assert ArabicNormalizer.normalize("تطـــــويل") == "تطويل"
    # Test diacritics removal
    normalized = ArabicNormalizer.normalize("الْحَمْدُ لِلَّهِ")
    assert "الحمد" in normalized  # Core word must be diacritics-free

@pytest.mark.asyncio
async def test_alignment_engine():
    segments = [
        "الحمد لله",
        "نحمده ونستعينه",
        "ونعوذ بالله من شرور أنفسنا",
        "ومن سيئات أعمالنا",
        "من يهده الله فلا مضل له",
        "ومن يضلل فلا هادي له"
    ]
    
    config = AlignmentConfig(window_size=2, similarity_threshold=0.7)
    engine = AlignmentEngine("script-123", "sess-123", segments, config)
    
    # 1. Match first segment
    event = await engine.process_asr_input("الحمد لله رب العالمين")
    assert event.event_type == "SEGMENT_MATCH"
    assert event.segment_index == 0
    assert engine.current_index == 1
    
    # 2. Match second segment
    event = await engine.process_asr_input("نحمده ونستعينه")
    assert event.event_type == "SEGMENT_MATCH"
    assert event.segment_index == 1
    assert engine.current_index == 2
    
    # 3. Deviation
    event = await engine.process_asr_input("كلام خارج النص")
    assert event.event_type == "DEVIATION"
    assert engine.current_index == 2
    
    # 4. Drift correction
    event = await engine.process_asr_input("من يهده الله فلا مضل له")
    assert event.event_type == "SEGMENT_MATCH"
    assert event.segment_index == 4
    assert engine.current_index == 5
    
def test_api_session_lifecycle():
    segments = ["السلام عليكم", "ورحمة الله"]
    # Start
    res = client.post("/api/align/start", json={"script_id": "test-script", "segments": segments})
    assert res.status_code == 200
    session_id = res.json()["session_id"]
    
    # Process
    res = client.post(f"/api/align/{session_id}/process", json={"asr_text": "السلام عليكم"})
    assert res.status_code == 200
    assert res.json()["event_type"] == "SEGMENT_MATCH"
    
    # State
    res = client.get(f"/api/align/{session_id}/state")
    assert res.status_code == 200
    assert res.json()["current_index"] == 1
    assert res.json()["matched_segments"] == 1
    
    # Reset
    res = client.post(f"/api/align/{session_id}/reset")
    assert res.status_code == 200
    res = client.get(f"/api/align/{session_id}/state")
    assert res.json()["current_index"] == 0
    
    # Delete
    res = client.delete(f"/api/align/{session_id}")
    assert res.status_code == 200
    assert session_store.get_session(session_id) is None
