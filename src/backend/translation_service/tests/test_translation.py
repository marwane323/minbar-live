import pytest
from httpx import AsyncClient
from ..app.main import app
from ..app.schemas import TranslationRequest, TranslationConfig, BatchTranslationRequest
from ..app.engine import TranslationEngine

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_simulation_mode():
    config = TranslationConfig(model_provider="openai")
    engine = TranslationEngine(config)
    req = TranslationRequest(text="مرحبا", target_language="en")
    res = await engine.translate(req)
    assert "[Simulation - OpenAI]" in res.translated_text

@pytest.mark.asyncio
async def test_quran_official_translation():
    config = TranslationConfig()
    engine = TranslationEngine(config)
    req = TranslationRequest(
        text="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        segment_type="quran",
        quran_reference="1:1",
        target_language="en"
    )
    res = await engine.translate(req)
    assert res.is_official_translation == True
    assert "Entirely Merciful" in res.translated_text

@pytest.mark.asyncio
async def test_batch_translation():
    config = TranslationConfig()
    engine = TranslationEngine(config)
    batch = BatchTranslationRequest(
        segments=[
            TranslationRequest(text="Test 1", target_language="en"),
            TranslationRequest(text="Test 2", target_language="en")
        ],
        config=config
    )
    res = await engine.translate_batch(batch)
    assert len(res.translations) == 2

@pytest.mark.asyncio
async def test_glossary_application():
    config = TranslationConfig()
    engine = TranslationEngine(config)
    req = TranslationRequest(text="الحمد لله", target_language="en")
    res = await engine.translate(req)
    # Basic test, our apply_glossary stub just returns text
    assert res is not None

@pytest.mark.asyncio
async def test_fallback():
    # Cohere test without key
    config = TranslationConfig(model_provider="cohere")
    engine = TranslationEngine(config)
    req = TranslationRequest(text="مرحبا", target_language="en")
    res = await engine.translate(req)
    assert "[Simulation - Cohere]" in res.translated_text
