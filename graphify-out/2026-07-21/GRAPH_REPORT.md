# Graph Report - minbar-live  (2026-07-21)

## Corpus Check
- 106 files · ~21,004 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 606 nodes · 885 edges · 51 communities (39 shown, 12 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 112 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1873fd46`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- quran_service/app/main.py
- api_gateway/app/main.py
- TranslationEngine
- 🕌 Minbar Live — Agent Context File (CLAUDE.md)
- AlignmentEngine
- devDependencies
- ASRConfig
- 3. Agent Task Breakdown
- config.py
- compilerOptions
- models.py
- 🧠 AI Model Selection Guide — Minbar Live
- test_asr.py
- 🤖 Agent Harness — Minbar Live
- layout.tsx
- Architecture Decision Records (ADRs)
- package.json
- shared
- 🕌 Minbar Live
- auth.ts
- extends
- docs/README.md
- GEMINI.md
- next.config.mjs
- postcss.config.mjs
- components/README.md
- tailwind.config.ts
- infrastructure/README.md
- ml_pipeline/README.md
- conftest.py
- tests/README.md
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `TranslationEngine` - 26 edges
2. `TranslationRequest` - 22 edges
3. `3. Agent Task Breakdown` - 18 edges
4. `compilerOptions` - 16 edges
5. `AlignmentEngine` - 15 edges
6. `TranslationResponse` - 15 edges
7. `Base` - 14 edges
8. `TranslationConfig` - 14 edges
9. `test_models_have_tablenames()` - 13 edges
10. `ASRConfig` - 12 edges

## Surprising Connections (you probably didn't know these)
- `test_expired_token()` --calls--> `verify_token()`  [INFERRED]
  tests/test_auth.py → src/backend/shared/shared/auth.py
- `test_invalid_token()` --calls--> `verify_token()`  [INFERRED]
  tests/test_auth.py → src/backend/shared/shared/auth.py
- `test_jwt_expiry_detection()` --calls--> `verify_token()`  [INFERRED]
  tests/test_integration_sprint1.py → src/backend/shared/shared/auth.py
- `test_set_tenant_context_accepts_valid_uuid()` --calls--> `set_tenant_context()`  [INFERRED]
  tests/test_integration_sprint1.py → src/backend/shared/shared/database.py
- `test_set_tenant_context_rejects_non_uuid()` --calls--> `set_tenant_context()`  [INFERRED]
  tests/test_integration_sprint1.py → src/backend/shared/shared/database.py

## Import Cycles
- None detected.

## Communities (51 total, 12 thin omitted)

### Community 0 - "quran_service/app/main.py"
Cohesion: 0.05
Nodes (28): Path, QuranCorpus, Load the Quran corpus from JSON files., Get a specific verse by surah and ayah number., Search for matches in the corpus., DetectionEngine, HadithMatcher, Path (+20 more)

### Community 1 - "api_gateway/app/main.py"
Cohesion: 0.06
Nodes (40): BaseHTTPMiddleware, OAuth2PasswordRequestForm, get_me(), login(), Any, AsyncSession, Request, refresh_token() (+32 more)

### Community 2 - "TranslationEngine"
Cohesion: 0.13
Nodes (23): TranslationEngine, GlossaryManager, get_glossary(), pregenerate(), translate_batch(), translate_segment(), CohereProvider, OllamaProvider (+15 more)

### Community 3 - "🕌 Minbar Live — Agent Context File (CLAUDE.md)"
Cohesion: 0.04
Nodes (41): 1. High-Level Architecture, 2.1 Core Services, 2.2 Data Stores, 2. Service Breakdown, 3. Database Schema (Key Tables), 4. WebSocket Protocol, 5. Latency Budget, 6. Multi-Tenancy Architecture (+33 more)

### Community 4 - "AlignmentEngine"
Cohesion: 0.11
Nodes (18): AlignmentEngine, align_websocket(), process_text(), ProcessInputRequest, BaseModel, WebSocket, start_session(), ArabicNormalizer (+10 more)

### Community 5 - "devDependencies"
Cohesion: 0.05
Nodes (36): autoprefixer, eslint, eslint-config-next, next, next-auth, postcss, react, react-dom (+28 more)

### Community 6 - "ASRConfig"
Cohesion: 0.10
Nodes (15): ASREngine, CohereASREngine, ABC, # TODO: Load actual Cohere client or model here, # TODO: Load faster-whisper model here, WhisperASREngine, WebSocket, websocket_endpoint() (+7 more)

### Community 7 - "3. Agent Task Breakdown"
Cohesion: 0.06
Nodes (31): 0. Project Identity, 1.1 Imam Preparation Portal, 1.2 Live Operator / AV Portal, 1.3 Listener Portal (Mobile-first PWA), 1.4 Admin & Settings Portal, 1.5 Additional Features (SaaS-level), 1. Core Feature Requirements, 2. Technical Architecture Overview (+23 more)

### Community 8 - "config.py"
Cohesion: 0.09
Nodes (13): BaseSettings, LogRecord, do_run_migrations(), get_url(), Run migrations in 'offline' mode., In this scenario we need to create an Engine     and associate a connection with, Run migrations in 'online' mode., run_async_migrations() (+5 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 10 - "models.py"
Cohesion: 0.30
Nodes (19): DeclarativeBase, main(), AuditLog, Base, HadithCache, KhutbaScript, KhutbaSegment, QuranVerseCache (+11 more)

### Community 11 - "🧠 AI Model Selection Guide — Minbar Live"
Cohesion: 0.09
Nodes (21): 1. Arabic ASR (Speech Recognition), 2. LLM for Translation, 3. Voice Cloning & TTS, 4. Quran & Hadith Detection, 5. Supporting NLP Tools, 6. Model Serving Infrastructure, 🧠 AI Model Selection Guide — Minbar Live, Alignment (+13 more)

### Community 12 - "test_asr.py"
Cohesion: 0.11
Nodes (14): chunk_audio(), detect_silence(), preprocess_audio(), Voice activity detection using RMS energy.     Assumes raw_bytes is 16-bit PCM., Splits an audio stream into chunks of chunk_duration_ms.     Assumes raw 16-bit, Normalizes and resamples audio.     Assumes raw_bytes is a valid audio format (e, detect_dialect(), Detects Arabic dialect based on keyword heuristics.     Returns (dialect, confid (+6 more)

### Community 13 - "🤖 Agent Harness — Minbar Live"
Cohesion: 0.11
Nodes (18): 1.1 Senior Islamic Scholar, 1.2 Senior LLM Engineer, 1.3 Senior System Architect, 1.4 Senior Full-Stack Engineer, 1.5 Senior ML/AI Engineer, 1. Agent Identity & Expertise, 2. Behavioral Rules, 3.1 Context Injection Strategy (+10 more)

### Community 14 - "layout.tsx"
Cohesion: 0.11
Nodes (16): !, ^lint, .next/**, .next/cache/**, inter, metadata, notoNaskhArabic, outputs (+8 more)

### Community 15 - "Architecture Decision Records (ADRs)"
Cohesion: 0.13
Nodes (14): ADR-001: Monorepo Structure, ADR-002: Primary ASR Model, ADR-003: Voice Cloning Model, ADR-004: Multi-Tenancy Strategy, ADR-005: Translation LLM Strategy, ADR-006: Imam Voice Consent & GDPR, ADR-007: Docker Internal Port Strategy, ADR-008: Tenant ID SQL Injection Prevention (+6 more)

### Community 16 - "package.json"
Cohesion: 0.15
Nodes (12): devDependencies, turbo, turbo, name, private, scripts, build, dev (+4 more)

### Community 17 - "shared"
Cohesion: 0.20
Nodes (10): alignment_service, api_gateway, asr_service, quran_service, session_manager, shared, translation_service, tts_service (+2 more)

### Community 18 - "🕌 Minbar Live"
Cohesion: 0.29
Nodes (6): 📜 License, 🕌 Minbar Live, 🚀 Quick Start for Agent Prompting, 📁 Repository Structure, 🌍 Supported Languages (Initial), ✨ What is Minbar Live?

### Community 20 - "extends"
Cohesion: 0.50
Nodes (3): next/core-web-vitals, next/typescript, extends

## Knowledge Gaps
- **191 isolated node(s):** `name`, `version`, `private`, `src/frontend`, `dev` (+186 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 11 inferred relationships involving `TranslationEngine` (e.g. with `GlossaryManager` and `CohereProvider`) actually correct?**
  _`TranslationEngine` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `TranslationRequest` (e.g. with `TranslationEngine` and `CohereProvider`) actually correct?**
  _`TranslationRequest` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `AlignmentEngine` (e.g. with `ArabicNormalizer` and `AlignmentConfig`) actually correct?**
  _`AlignmentEngine` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _191 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `quran_service/app/main.py` be split into smaller, more focused modules?**
  _Cohesion score 0.050505050505050504 - nodes in this community are weakly interconnected._
- **Should `api_gateway/app/main.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06292517006802721 - nodes in this community are weakly interconnected._
- **Should `TranslationEngine` be split into smaller, more focused modules?**
  _Cohesion score 0.13297872340425532 - nodes in this community are weakly interconnected._