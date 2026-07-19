# 🧠 AI Model Selection Guide — Minbar Live

## 1. Arabic ASR (Speech Recognition)

### Primary Recommendation
**CohereLabs/cohere-transcribe-arabic-07-2026**
- License: Apache 2.0 ✅
- WER: 25.87% (best open-source Arabic ASR as of July 2026)
- Source: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Strengths: Best open-source Arabic WER, dialect-robust
- Deployment: Hugging Face Transformers, can run locally

### Fallback
**openai/whisper-large-v3-turbo** (via faster-whisper)
- License: MIT ✅
- WER: ~26.8% on Emirati Arabic; excellent on MSA
- Source: https://github.com/openai/whisper
- Strengths: Battle-tested, fast with faster-whisper backend, streaming support
- Deployment: `pip install faster-whisper`

### Cloud API Option
**OpenAI Whisper API** (`whisper-1`)
- Use for: high-volume production when GPU unavailable
- Cost: $0.006/min
- Latency: ~1–2s per chunk (not streaming)

### Arabic ASR Leaderboard Reference
- https://github.com/Natural-Language-Processing-Elm/open_universal_arabic_asr_leaderboard

---

## 2. LLM for Translation

### Local (Self-hosted via Ollama)
**aya-expanse:32b** (Cohere, MIT-like)
- Best multilingual open model for Islamic content
- 32B parameters, runs on 2× A100 or 4× RTX 4090

**aya-expanse:8b** (lighter version)
- Runs on single RTX 3090/4090
- Acceptable for single-language pairs

### API Options
| Model | Provider | Strength | Cost |
|---|---|---|---|
| GPT-4o | OpenAI | Best overall quality | $5/M input tokens |
| Command R+ | Cohere | Strong multilingual, RAG-optimized | $3/M input tokens |
| Claude 3.5 Sonnet | Anthropic | Excellent instruction following | $3/M input tokens |
| Gemini 1.5 Pro | Google | Long context for full Khutba | $3.5/M input tokens |

### Recommended Default Config
```yaml
llm:
  primary: ollama/aya-expanse:8b  # local, free
  fallback: cohere/command-r-plus  # API fallback
  temperature: 0.1  # low temperature for consistent religious terminology
  max_tokens: 512
  timeout_seconds: 10
```

---

## 3. Voice Cloning & TTS

### Primary: Chatterbox Multilingual
- **License:** MIT ✅
- **Languages:** 23 (includes Arabic, English, French, Urdu, Swahili, Bengali, Indonesian, Malay, Turkish, German, Spanish, Portuguese)
- **Voice cloning:** Zero-shot from 3–10 minute audio sample
- **Emotion control:** Yes (useful for matching Khutba rhetorical style)
- **Watermarking:** PerTh neural watermarking built-in
- **Source:** https://github.com/resemble-ai/chatterbox
- **Install:** `pip install chatterbox-tts`

### Alternative: XTTS-v2 (Coqui)
- License: Coqui Public Model License (non-commercial)
- Languages: 17
- Good Arabic quality
- Source: https://huggingface.co/coqui/XTTS-v2

### Arabic-Specific TTS
**ArTST** (MBZUAI)
- License: CC BY 4.0
- Arabic TTS and STT
- Source: https://github.com/mbzuai-nlp/ArTST

---

## 4. Quran & Hadith Detection

### Quran Detection
**Approach:** Fuzzy string matching against verified Arabic Quran corpus

```python
# Tools
from rapidfuzz import fuzz
import json

# Corpus: evidentdata/quran-json (MIT)
# 6236 verses × normalized Arabic text
# Match threshold: 0.85 cosine similarity

# Alternative: quran-ai-transcribing (Quran verse detection with 100% accuracy)
# Source: https://github.com/sayedmahmoud266/quran-ai-transcriping
```

**Translation sources:**
- quranenc.com API (free, multiple scholarly translations)
- Local quran.json with pre-loaded Sahih International + Yusuf Ali

### Hadith Detection
**sunnah.com API** (for lookup after detection)
- Free tier available
- Covers Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah

**HadithAPI** (open source)
- Source: https://github.com/fawazahmed0/hadith-api
- Self-hostable JSON corpus
- 9 books, multiple languages

---

## 5. Supporting NLP Tools

### Arabic Text Processing
| Tool | Purpose | License |
|---|---|---|
| CAMeL Tools | Morphological analysis, diacritization, dialect identification | MIT |
| Farasa | Segmentation, POS tagging | Free for research |
| pyarabic | Arabic text utilities, normalization | GPL |
| arabic-reshaper | Proper Arabic text rendering in images/PDFs | GPL |

### Alignment
| Tool | Purpose |
|---|---|
| rapidfuzz | Fuzzy string matching for Khutba alignment |
| dtw-python | Dynamic Time Warping for audio-text alignment |
| aeneas | Audio-text forced alignment (for video captions) |

---

## 6. Model Serving Infrastructure

```yaml
# Recommended GPU setup for full local deployment
minimum_gpu: "NVIDIA RTX 4090 (24GB VRAM)"
recommended_gpu: "NVIDIA A100 (40GB VRAM)"

# Service allocation
asr_service: 6GB VRAM (Cohere ASR or Whisper large-v3)
tts_service: 8GB VRAM (Chatterbox Multilingual)
llm_service: 16GB VRAM (aya-expanse:8b via Ollama)

# CPU fallback (latency ×3–5)
asr_cpu: faster-whisper small or medium model
tts_cpu: Coqui VITS (lighter model)
llm_cpu: ollama/phi3:mini or llama3.2:3b
```
