# 🧪 Minbar Live — Sprint 2 Test Report

**Date:** 2026-07-21  
**Sprint:** Sprint 2 — ML Pipeline + Sprint 3 Voice (partial)  
**Agents Completed:** AGENT-4, AGENT-5, AGENT-6, AGENT-7, AGENT-8  

---

## Services Implemented

- **AGENT-4:** ASR Pipeline (Cohere/Whisper engines, dialect detection, WS + REST)
- **AGENT-5:** Alignment Engine (Sliding window + DTW drift correction with rapidfuzz)
- **AGENT-6:** LLM Translation (Ollama/OpenAI/Cohere, Islamic glossary, verified Quran translations)
- **AGENT-7:** Quran & Hadith Detection (Arabic normalization, trigram fuzzy matching on `quran.json`)
- **AGENT-8:** TTS & Voice Cloning (Chatterbox mock engine, sine wave WAV audio, pre-generation queue)

---

## Test Execution Commands

```powershell
# Sprint 1 (auth, models, JWT)
$env:PYTHONPATH = "C:\Projects\Khutba\minbar-live\src\backend\shared"
python -m pytest tests/ src/backend/shared/tests/ -v --tb=short

# Per-service Sprint 2 tests
foreach ($svc in @("asr_service","quran_service","alignment_service","translation_service","tts_service")) {
    $env:PYTHONPATH = "C:\Projects\Khutba\minbar-live\src\backend\shared;C:\Projects\Khutba\minbar-live\src\backend\$svc"
    python -m pytest "src/backend/$svc/tests/" -v --tb=short
}
```
