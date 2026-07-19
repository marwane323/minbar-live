# 🕌 Minbar Live

> **AI-powered live Khutba sermon translation, transcription & dubbing platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status: Scaffolding](https://img.shields.io/badge/Status-Scaffolding-yellow.svg)](#)

**Minbar** (منبر) means *pulpit* in Arabic — the elevated platform from which the Imam delivers the Khutba. Minbar Live brings that message to every listener in their own language, in real time.

---

## ✨ What is Minbar Live?

Minbar Live is a SaaS/PaaS web application that provides:

- 🎙️ **Live Arabic ASR** — Real-time transcription of the Imam's speech using state-of-the-art open-source models (Cohere Transcribe Arabic, Whisper-large-v3-turbo)
- 🌐 **Live multilingual translation** — LLM-powered contextual translation preserving Islamic terminology
- 🔊 **Voice cloning & dubbing** — Imam voice cloned via Chatterbox Multilingual; audio streamed to listeners in their language
- 📖 **Quran verse detection** — Automatic identification and lookup of Quranic ayat during the Khutba
- 📝 **Pre-loaded Khutba** — Imam uploads full script beforehand; app aligns live speech to pre-translation for instant accuracy
- 📱 **QR code listener portal** — Attendees scan a QR code to follow along on their phone in any supported language
- 🏛️ **Multi-tenant SaaS** — Each mosque/school has its own isolated instance

---

## 📁 Repository Structure

```
minbar-live/
├── main_prompt.md          ← Master agentic build prompt (load into your LLM agent)
├── AGENT_HARNESS.md        ← Agent persona, skills, constraints (like Claude.md)
├── ARCHITECTURE.md         ← Full system architecture & tech stack
├── MODELS.md               ← AI model selection guide (ASR, TTS, LLM, cloning)
├── SKILLS.md               ← External GitHub skill repos to reduce token use
├── PROGRESS.md             ← Sprint tracker & milestone board
├── ISSUES.md               ← Known issues, bugs, decisions log
├── docs/
│   ├── UI_UX.md            ← Portal wireframe descriptions & design system
│   ├── API_SPEC.md         ← REST & WebSocket API specification
│   ├── SECURITY.md         ← Auth, multi-tenancy, data privacy
│   └── DEPLOYMENT.md       ← Docker, K8s, cloud hosting guide
└── src/                    ← Source code (populated by agent iterations)
    ├── backend/
    ├── frontend/
    ├── ml_pipeline/
    └── infrastructure/
```

---

## 🚀 Quick Start for Agent Prompting

1. Clone this repo
2. Load `AGENT_HARNESS.md` as your system/context file
3. Paste `main_prompt.md` as the first user message to your agentic LLM
4. Reference `SKILLS.md` to pre-load external tool repos
5. Track progress in `PROGRESS.md` and issues in `ISSUES.md`

---

## 🌍 Supported Languages (Initial)

Arabic · English · French · Spanish · Turkish · Urdu · Indonesian · Malay · Swahili · Bengali · Hausa · Somali · German · Portuguese

---

## 📜 License

MIT — free for mosques, Islamic schools, and community organizations.
