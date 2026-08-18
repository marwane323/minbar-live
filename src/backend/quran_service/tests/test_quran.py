import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.normalizer import normalize_arabic, calculate_similarity

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_arabic_normalizer():
    # Test tashkeel removal
    assert normalize_arabic("بِسْمِ اللَّهِ") == "بسم الله"
    
    # Test alef normalization
    assert normalize_arabic("إأآٱ") == "اااا"
    
    # Test taa marbuta
    assert normalize_arabic("مكة") == "مكه"
    
    # Test alef maksura
    assert normalize_arabic("هدى") == "هدي"
    
    # Combined complex test
    original = "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ"
    expected = "الله لا اله الا هو الحي القيوم"
    assert normalize_arabic(original) == expected

def test_similarity_calculation():
    # Same string
    assert calculate_similarity("الحمد لله", "الحمد لله") == 1.0
    
    # Different string
    assert calculate_similarity("الحمد لله", "بسم الله") < 1.0

def test_detect_quran_ayat_al_kursi():
    text = "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ"
    
    response = client.post("/api/detect/quran", json={
        "text": text,
        "min_similarity": 0.80
    })
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["quran_matches"]) > 0
    match = data["quran_matches"][0]
    assert match["surah_number"] == 2
    assert match["ayah_number"] == 255

def test_detect_hadith():
    text = "عَنْ عُمَرَ بْنِ الْخَطَّابِ، قَالَ سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ"
    
    response = client.post("/api/detect/hadith", json={
        "text": text,
        "min_similarity": 0.80
    })
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["hadith_matches"]) > 0
    match = data["hadith_matches"][0]
    assert match["collection"] == "bukhari"
    assert match["hadith_number"] == "1"

def test_detect_non_quranic_text():
    # General Arabic text that is not Quran or Hadith
    text = "ذهب الطالب إلى المدرسة في الصباح الباكر ليتعلم الدروس"
    
    response = client.post("/api/detect", json={
        "text": text,
        "min_similarity": 0.85
    })
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["quran_matches"]) == 0
    assert len(data["hadith_matches"]) == 0

def test_get_verse_endpoint():
    response = client.get("/api/quran/1/1")
    assert response.status_code == 200
    data = response.json()
    assert data["surah_number"] == 1
    assert data["ayah_number"] == 1
    assert "بِسْمِ اللَّهِ" in data["arabic_text"]

def test_get_hadith_endpoint():
    response = client.get("/api/hadith/bukhari/1")
    assert response.status_code == 200
    data = response.json()
    assert data["collection"] == "bukhari"
    assert data["hadith_number"] == "1"
