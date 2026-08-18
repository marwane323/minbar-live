from fastapi import FastAPI
from typing import Dict
from .schemas import TranslationRequest, TranslationResponse, BatchTranslationRequest, BatchTranslationResponse, TranslationConfig
from .engine import TranslationEngine
from .glossary import GlossaryManager

app = FastAPI(title="Minbar Live Translation Service")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/translate", response_model=TranslationResponse)
async def translate_segment(request: TranslationRequest):
    config = TranslationConfig()
    engine = TranslationEngine(config)
    return await engine.translate(request)

@app.post("/api/translate/batch", response_model=BatchTranslationResponse)
async def translate_batch(batch: BatchTranslationRequest):
    engine = TranslationEngine(batch.config)
    return await engine.translate_batch(batch)

@app.get("/api/translate/glossary")
async def get_glossary(source_lang: str = "ar", target_lang: str = "en"):
    manager = GlossaryManager()
    return {"terms": manager.get_terms(source_lang, target_lang)}

@app.post("/api/translate/pregenerate", response_model=BatchTranslationResponse)
async def pregenerate(batch: BatchTranslationRequest):
    engine = TranslationEngine(batch.config)
    return await engine.translate_batch(batch)
