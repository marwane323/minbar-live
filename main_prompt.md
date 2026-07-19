# 🕌 Minbar Live — Master Agentic Build Prompt

> **Instructions for the orchestrating LLM agent:**  
> You are a multi-agent orchestrator. Read this entire document before spawning any sub-agents. Each section marked `[AGENT-N]` defines a focused sub-agent task. Execute them in order unless parallelism is explicitly noted. After each agent completes, validate its output against the acceptance criteria before proceeding. Log all decisions, errors, and deviations to `ISSUES.md` and update `PROGRESS.md`.

---

## 0. Project Identity

| Field | Value |
|---|---|
| **Product Name** | Minbar Live (منبر لايف) |
| **Tagline** | *Every word of the Khutba, in every language* |
| **Type** | SaaS / PaaS web application |
| **Primary Users** | Imams, mosque AV operators, congregation listeners, mosque admins |
| **Inspiration** | Baian.ai (baian.ai) |
| **Differentiator** | Pre-loaded Khutba alignment, Imam voice cloning, Quran/Hadith detection, full open-source AI stack |

---

## 1. Core Feature Requirements

### 1.1 Imam Preparation Portal
- [ ] Rich-text editor to type/paste the full Khutba script before the session
- [ ] Language tagging per paragraph (Arabic MSA, dialect, English, etc.)
- [ ] Automatic Quran ayah detector — highlight detected verses, show surah/ayah reference, pull translation from Quranenc API or local quran.json
- [ ] Hadith detector — fuzzy match against local hadith corpus (HadithAPI or sunnah.com API)
- [ ] LLM-powered pre-translation of script into all target languages with Islamic terminology preservation
- [ ] Imam can review and manually correct each translated segment
- [ ] Voice sample upload (3–10 min audio) to train Imam voice clone via Chatterbox Multilingual
- [ ] Pre-generate TTS audio for each translated segment using cloned voice
- [ ] Session configuration: title, date, target languages, mosque instance
- [ ] Save/load draft Khutbas; export as PDF summary

### 1.2 Live Operator / AV Portal
- [ ] Audio input device selector (microphone, sound card, AV mixer input)
- [ ] Real-time ASR display: live transcript with word-level timestamps
- [ ] Alignment engine: highlight current position in pre-loaded Khutba script as Imam speaks
- [ ] Multi-language output panel showing current translation per language
- [ ] OBS/streaming caption link (WebSocket URL for each language)
- [ ] QR code generator per session linking to listener portal
- [ ] Shareable session URL
- [ ] Live latency monitor (<1 second target)
- [ ] Mute/pause/end session controls
- [ ] Session recording toggle

### 1.3 Listener Portal (Mobile-first PWA)
- [ ] Access via QR code scan or direct URL (no account required)
- [ ] Language selector on entry
- [ ] Two modes: READ (live text subtitles) and LISTEN (live dubbed audio)
- [ ] Smooth auto-scroll following live speech
- [ ] Quran verses rendered in Arabic calligraphy font with translation
- [ ] Session summary download (PDF/TXT) after session ends
- [ ] Offline fallback: last received segment cached for poor connectivity
- [ ] Accessibility: font size control, high-contrast mode, RTL/LTR toggle

### 1.4 Admin & Settings Portal
- [ ] Mosque/organization account management (multi-tenant)
- [ ] User management: Imam accounts, operator accounts, admin accounts
- [ ] Billing & subscription management (Stripe integration)
- [ ] Session history: view, search, edit, hide/unhide, delete past sessions
- [ ] Analytics dashboard: session count, listener count, languages used, latency stats
- [ ] Language configuration: enable/disable languages per instance
- [ ] AI model selection per instance (choose ASR model, LLM endpoint, TTS model)
- [ ] Custom branding: mosque logo, colors, custom domain
- [ ] API key management for external integrations
- [ ] Audit logs

### 1.5 Additional Features (SaaS-level)
- [ ] Baian Captions equivalent: upload recorded video, generate multi-language SRT subtitles
- [ ] Code-switching support: Imam switches between Arabic and English mid-sentence
- [ ] Accent robustness (MSA, Gulf, Levantine, Maghrebi, Egyptian)
- [ ] Session replay with synchronized multi-language subtitles
- [ ] Webhook support for integrations (e.g. mosque website embedding)
- [ ] White-label support for resellers

---

## 2. Technical Architecture Overview

See `ARCHITECTURE.md` for full detail. Summary:

```
[Imam Mic] → [ASR Engine] → [Alignment Engine] → [LLM Translation] → [TTS/Voice Clone]
                                                          ↓
                                              [WebSocket Broadcast]
                                                  ↙         ↘
                                    [Listener PWA]    [OBS Caption URL]
```

**Backend:** FastAPI (Python) + WebSockets + Celery task queue  
**Frontend:** Next.js 14 (App Router) + TailwindCSS + shadcn/ui  
**Database:** PostgreSQL (primary) + Redis (session/pub-sub) + S3-compatible (audio/media)  
**ML Pipeline:** Hugging Face Transformers + faster-whisper + Chatterbox Multilingual  
**LLM:** Ollama (local) or OpenAI/Anthropic/Cohere API (configurable per instance)  
**Auth:** NextAuth.js + JWT + row-level security for multi-tenancy  
**Infra:** Docker Compose (dev) → Kubernetes + Helm (prod) → deployable on AWS/GCP/Hetzner  

---

## 3. Agent Task Breakdown

### [AGENT-1] Project Scaffold & Repository Structure
**Objective:** Create the full monorepo directory structure, package.json, pyproject.toml, docker-compose.dev.yml, .env.example, .gitignore, pre-commit hooks.  
**Acceptance:** `docker-compose up` starts all services with health checks passing.

### [AGENT-2] Database Schema & Migrations
**Objective:** Design and implement PostgreSQL schema using Alembic migrations.  
**Tables:** tenants, users, sessions, khutba_scripts, khutba_segments, translations, voice_profiles, quran_verses_cache, hadith_cache, session_events, audit_logs.  
**Acceptance:** All migrations run cleanly; seed data for a test mosque tenant.

### [AGENT-3] Authentication & Multi-Tenancy
**Objective:** Implement NextAuth.js with credentials + magic link. JWT with tenant_id claim. Row-level security in PostgreSQL. Middleware to scope all API calls to tenant.  
**Acceptance:** User from Mosque A cannot access Mosque B data under any circumstances.

### [AGENT-4] ASR Pipeline
**Objective:** Implement real-time Arabic ASR service.  
**Primary model:** `CohereLabs/cohere-transcribe-arabic-07-2026` (Apache 2.0).  
**Fallback:** `openai/whisper-large-v3-turbo` (faster-whisper backend).  
**Features:** Streaming transcription via WebSocket, word-level timestamps, confidence scores, dialect detection.  
**Acceptance:** <800ms first-token latency on GPU; <2s on CPU-only.

### [AGENT-5] Alignment Engine
**Objective:** Given a pre-loaded Khutba script and live ASR output, compute alignment in real time.  
**Algorithm:** Sliding window fuzzy match (rapidfuzz) + dynamic time warping for drift correction.  
**Output:** Current segment index + confidence; emit `SEGMENT_MATCH` events.  
**Acceptance:** Correctly tracks position through a 30-minute Khutba with ≤2 segment drift.

### [AGENT-6] LLM Translation Service
**Objective:** Translate Khutba segments into target languages with Islamic context preservation.  
**System prompt:** See `AGENT_HARNESS.md` § Translation Prompt.  
**Models:** Configurable — Ollama (aya-expanse:32b recommended) locally; OpenAI GPT-4o / Cohere Command R+ via API.  
**Features:** Pre-translation during preparation phase; live patch translation for unscripted deviations; terminology glossary per mosque.  
**Acceptance:** Quran verse translations use official tafsir-aligned wording, not generic MT output.

### [AGENT-7] Quran & Hadith Detection
**Objective:** Detect Quranic ayat and hadith in the live/pre-loaded transcript.  
**Quran:** Use `quran-json` corpus (evidentdata/quran-json) + fuzzy matching (threshold ≥ 0.85). Cross-reference with `quranenc.com` API for translation.  
**Hadith:** Use `hadith-api` (A Hadith API) + sunnah.com API. Fuzzy match Arabic text.  
**Output:** Annotated segment with `{type: 'quran'|'hadith', reference: '...', translation: '...'}`.  
**Acceptance:** Detects ≥90% of common Khutba verses with no false positives on non-religious text.

### [AGENT-8] Voice Cloning & TTS
**Objective:** Clone Imam's voice and generate dubbed audio in target languages.  
**Model:** Chatterbox Multilingual (MIT license, 23 languages, zero-shot cloning).  
**Workflow:** (1) Imam uploads 3–10 min audio → extract clean segments → build voice profile. (2) Pre-generate audio for all translated script segments. (3) During live session, stream pre-generated audio triggered by alignment events; generate live TTS for unscripted deviations.  
**Acceptance:** Generated audio is intelligible; MOS score ≥ 3.5 in blind listening test.

### [AGENT-9] WebSocket Broadcast Layer
**Objective:** Real-time pub/sub for all session events to listeners.  
**Stack:** FastAPI WebSockets + Redis pub/sub (fallback: Server-Sent Events for read-only clients).  
**Channels:** `{session_id}:transcript`, `{session_id}:translation:{lang}`, `{session_id}:audio:{lang}`, `{session_id}:events`.  
**Acceptance:** 500 concurrent listeners per session with <200ms message delivery.

### [AGENT-10] Imam Preparation Frontend
**Objective:** Build the Imam portal in Next.js.  
**Pages:** `/imam/dashboard`, `/imam/khutba/new`, `/imam/khutba/[id]/edit`, `/imam/khutba/[id]/translate`, `/imam/voice-setup`, `/imam/sessions`.  
**Components:** KhutbaEditor (rich text, Arabic RTL support), VerseHighlighter, TranslationReview, VoiceProfileSetup.  
**Acceptance:** Full preparation workflow completable end-to-end in <15 minutes.

### [AGENT-11] Live Operator Frontend
**Objective:** Build the operator/AV portal.  
**Pages:** `/session/[id]/operate`.  
**Components:** AudioDeviceSelector, LiveTranscriptDisplay (scrolling, highlighted current segment), MultiLanguagePanel, QRCodeDisplay, SessionControls, LatencyMonitor.  
**Acceptance:** All controls responsive; no UI lag during live session.

### [AGENT-12] Listener PWA
**Objective:** Build the mobile-first listener portal as a Progressive Web App.  
**Pages:** `/listen/[session_id]`.  
**Features:** Language selector, Read/Listen toggle, auto-scroll, offline cache, Quran verse styling, summary download.  
**Acceptance:** Loads in <2s on 4G; works with JS disabled for text-only mode.

### [AGENT-13] Admin Portal
**Objective:** Build the admin dashboard.  
**Pages:** `/admin/dashboard`, `/admin/users`, `/admin/sessions`, `/admin/settings`, `/admin/billing`, `/admin/branding`.  
**Acceptance:** All CRUD operations functional; analytics charts rendering correctly.

### [AGENT-14] Captions for Video (Async)
**Objective:** Upload recorded video/audio → transcribe → generate multi-language SRT files.  
**Stack:** Celery task + faster-whisper + LLM translation + SRT formatter.  
**Acceptance:** 1-hour video processed in <10 minutes on GPU.

### [AGENT-15] Security Hardening & Audit
**Objective:** Run OWASP checklist, dependency audit, secret scanning, rate limiting, CORS hardening, CSP headers, input sanitization.  
**Tools:** Bandit (Python), npm audit, OWASP ZAP scan.  
**Acceptance:** Zero critical/high CVEs; pen test report attached.

### [AGENT-16] CI/CD & Infrastructure
**Objective:** GitHub Actions CI (lint, test, build, Docker push). Kubernetes Helm chart. Terraform for cloud provisioning.  
**Acceptance:** Push to `main` triggers full pipeline; staging deploy in <5 minutes.

### [AGENT-17] Documentation & Demo
**Objective:** Write user-facing docs (Docusaurus), record demo video, create onboarding wizard for new mosque tenants.  
**Acceptance:** New mosque can self-onboard in <30 minutes without support.

---

## 4. Translation Prompt Template

This prompt is injected by AGENT-6 and refined per mosque instance:

```
You are an expert Islamic translator with deep knowledge of Quranic Arabic, Fiqh terminology, and scholarly Islamic discourse. You are translating a live Khutba (Friday sermon) delivered by an Imam.

CONTEXT:
- Mosque: {mosque_name}, {city}, {country}
- Topic hint: {khutba_topic}
- Imam's language: {source_language}
- Target language: {target_language}
- Congregation: {congregation_description}

RULES:
1. Preserve ALL Islamic terminology (e.g., Inshallah, Alhamdulillah, Subhanallah, Masha'Allah, Jazakallah, Ummah, Taqwa, Iman, etc.) — transliterate them, do not translate.
2. Quranic verses: use the established scholarly translation for {target_language}. Do NOT paraphrase.
3. Hadith quotations: maintain prophetic speech register.
4. Maintain the rhetorical register of a formal religious address.
5. Do not add content not present in the source.
6. If a term has no equivalent, use the Arabic term with a brief parenthetical explanation on first use.
7. Names of Allah's attributes (Al-Rahman, Al-Rahim, etc.) — keep in Arabic.

INPUT SEGMENT:
{segment_text}

PREVIOUS CONTEXT (last 3 segments):
{context_window}

OUTPUT: Translated segment only. No explanations. No markdown.
```

---

## 5. Logging & Observability Requirements

- **Structured logging:** JSON logs with `tenant_id`, `session_id`, `user_id`, `timestamp`, `level`, `service`, `message`, `latency_ms`
- **Tracing:** OpenTelemetry with Jaeger backend
- **Metrics:** Prometheus + Grafana — track ASR latency, translation latency, WebSocket connections, TTS generation time, error rates
- **Error tracking:** Sentry integration (both frontend and backend)
- **ASR quality log:** Save every transcription + human-corrected version for model fine-tuning data collection
- **Log retention:** 90 days hot, 1 year cold (S3)
- **Alerting:** PagerDuty/Opsgenie for P0 alerts (session failure, ASR down, latency >3s)

---

## 6. Security Constraints

- All audio data encrypted at rest (AES-256) and in transit (TLS 1.3)
- Imam voice clone data treated as biometric — stored encrypted, deletable on request (GDPR Article 17)
- Multi-tenancy: PostgreSQL row-level security policies enforced at DB level (not just application level)
- No cross-tenant data leakage in shared Redis — namespaced keys `{tenant_id}:{session_id}:*`
- Rate limiting: 100 req/min per IP on public endpoints; 1000 req/min for authenticated operators
- OWASP Top 10 compliance mandatory before production
- Secrets management: Vault or AWS Secrets Manager (no .env files in production)
- SOC 2 Type II roadmap for enterprise mosque clients

---

## 7. SaaS Pricing Tiers (Reference)

| Tier | Target | Features | Suggested Price |
|---|---|---|---|
| **Masjid Free** | Small mosques | 1 session/month, 2 languages, 50 listeners | Free |
| **Masjid Basic** | Growing mosques | 10 sessions/month, 5 languages, 200 listeners | $29/month |
| **Masjid Pro** | Active mosques | Unlimited sessions, 15 languages, 1000 listeners, voice cloning | $99/month |
| **Islamic School** | Schools & centers | Multi-Imam, captions for video, custom branding, analytics | $199/month |
| **Enterprise** | Large institutions | Custom SLA, on-premise deployment, white-label | Custom |
