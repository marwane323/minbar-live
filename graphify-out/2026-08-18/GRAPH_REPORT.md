# Graph Report - minbar-live  (2026-08-18)

## Corpus Check
- 124 files · ~26,907 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 758 nodes · 1168 edges · 64 communities (52 shown, 12 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 131 edges (avg confidence: 0.68)
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
- env.py
- BroadcastEvent
- test_integration_e2e.py
- websocket_hub/app/main.py
- 📊 Minbar Live — Project Progress Tracker
- Architecture Decision Records (ADRs)
- 🛠️ External Skills & GitHub Repositories — Minbar Live
- 🐛 Minbar Live — Issues, Decisions & Bug Log
- RedisPubSub
- CLAUDE.md
- TenantAuthMiddleware
- 🧪 Minbar Live — Sprint 2 Test Report

## God Nodes (most connected - your core abstractions)
1. `TranslationEngine` - 26 edges
2. `TranslationRequest` - 22 edges
3. `3. Agent Task Breakdown` - 18 edges
4. `BroadcastEvent` - 17 edges
5. `compilerOptions` - 16 edges
6. `AlignmentEngine` - 15 edges
7. `TranslationResponse` - 15 edges
8. `Base` - 14 edges
9. `TranslationConfig` - 14 edges
10. `TTSConfig` - 14 edges

## Surprising Connections (you probably didn't know these)
- `test_jwt_expiry_detection()` --calls--> `verify_token()`  [INFERRED]
  tests/test_integration_sprint1.py → src/backend/shared/shared/auth.py
- `test_expired_token()` --calls--> `verify_token()`  [INFERRED]
  tests/test_auth.py → src/backend/shared/shared/auth.py
- `test_invalid_token()` --calls--> `verify_token()`  [INFERRED]
  tests/test_auth.py → src/backend/shared/shared/auth.py
- `test_set_tenant_context_accepts_valid_uuid()` --calls--> `set_tenant_context()`  [INFERRED]
  tests/test_integration_sprint1.py → src/backend/shared/shared/database.py
- `test_set_tenant_context_rejects_non_uuid()` --calls--> `set_tenant_context()`  [INFERRED]
  tests/test_integration_sprint1.py → src/backend/shared/shared/database.py

## Import Cycles
- None detected.

## Communities (64 total, 12 thin omitted)

### Community 0 - "quran_service/app/main.py"
Cohesion: 0.05
Nodes (28): Path, QuranCorpus, Load the Quran corpus from JSON files., Get a specific verse by surah and ayah number., Search for matches in the corpus., DetectionEngine, HadithMatcher, Path (+20 more)

### Community 1 - "api_gateway/app/main.py"
Cohesion: 0.13
Nodes (22): OAuth2PasswordRequestForm, login(), AsyncSession, Request, refresh_token(), create_access_token(), get_current_user(), get_password_hash() (+14 more)

### Community 2 - "TranslationEngine"
Cohesion: 0.13
Nodes (23): TranslationEngine, GlossaryManager, get_glossary(), pregenerate(), translate_batch(), translate_segment(), CohereProvider, OllamaProvider (+15 more)

### Community 3 - "🕌 Minbar Live — Agent Context File (CLAUDE.md)"
Cohesion: 0.18
Nodes (10): 1. High-Level Architecture, 2.1 Core Services, 2.2 Data Stores, 2. Service Breakdown, 3. Database Schema (Key Tables), 4. WebSocket Protocol, 5. Latency Budget, 6. Multi-Tenancy Architecture (+2 more)

### Community 4 - "AlignmentEngine"
Cohesion: 0.11
Nodes (18): AlignmentEngine, align_websocket(), process_text(), ProcessInputRequest, BaseModel, WebSocket, start_session(), ArabicNormalizer (+10 more)

### Community 5 - "devDependencies"
Cohesion: 0.05
Nodes (36): autoprefixer, eslint, eslint-config-next, next, next-auth, postcss, react, react-dom (+28 more)

### Community 6 - "ASRConfig"
Cohesion: 0.06
Nodes (29): chunk_audio(), detect_silence(), preprocess_audio(), Voice activity detection using RMS energy.     Assumes raw_bytes is 16-bit PCM., Splits an audio stream into chunks of chunk_duration_ms.     Assumes raw 16-bit, Normalizes and resamples audio.     Assumes raw_bytes is a valid audio format (e, detect_dialect(), Detects Arabic dialect based on keyword heuristics.     Returns (dialect, confid (+21 more)

### Community 7 - "3. Agent Task Breakdown"
Cohesion: 0.06
Nodes (31): 0. Project Identity, 1.1 Imam Preparation Portal, 1.2 Live Operator / AV Portal, 1.3 Listener Portal (Mobile-first PWA), 1.4 Admin & Settings Portal, 1.5 Additional Features (SaaS-level), 1. Core Feature Requirements, 2. Technical Architecture Overview (+23 more)

### Community 8 - "config.py"
Cohesion: 0.06
Nodes (27): BaseHTTPMiddleware, BaseSettings, FastAPI, LogRecord, get_me(), Any, Settings, JSONFormatter (+19 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 10 - "models.py"
Cohesion: 0.14
Nodes (31): DeclarativeBase, main(), get_db(), AsyncSession, Set the PostgreSQL session variable for Row Level Security.      Uses parameteri, Yield an async database session., set_tenant_context(), AuditLog (+23 more)

### Community 11 - "🧠 AI Model Selection Guide — Minbar Live"
Cohesion: 0.09
Nodes (21): 1. Arabic ASR (Speech Recognition), 2. LLM for Translation, 3. Voice Cloning & TTS, 4. Quran & Hadith Detection, 5. Supporting NLP Tools, 6. Model Serving Infrastructure, 🧠 AI Model Selection Guide — Minbar Live, Alignment (+13 more)

### Community 12 - "test_asr.py"
Cohesion: 0.08
Nodes (26): estimate_speech_duration(), generate_silence(), generate_sine_wave(), ChatterboxEngine, FallbackTTSEngine, ABC, # TODO: Implement real Chatterbox model synthesis, # TODO: Implement real Chatterbox model voice cloning (+18 more)

### Community 13 - "🤖 Agent Harness — Minbar Live"
Cohesion: 0.11
Nodes (18): 1.1 Senior Islamic Scholar, 1.2 Senior LLM Engineer, 1.3 Senior System Architect, 1.4 Senior Full-Stack Engineer, 1.5 Senior ML/AI Engineer, 1. Agent Identity & Expertise, 2. Behavioral Rules, 3.1 Context Injection Strategy (+10 more)

### Community 14 - "layout.tsx"
Cohesion: 0.11
Nodes (16): !, ^lint, .next/**, .next/cache/**, inter, metadata, notoNaskhArabic, outputs (+8 more)

### Community 15 - "Architecture Decision Records (ADRs)"
Cohesion: 0.15
Nodes (13): 📝 AI Agent Prompt Handover Protocol (`./prompts/`), 📊 Current Progress, 🏗️ Directory Structure, 🔗 Key External Resources, 📁 Key Files (Read These First), 🕌 Minbar Live — Agent Context File (CLAUDE.md), 🧠 Model Decisions (from ADRs in ISSUES.md), 🤖 Multi-Agent Protocol (+5 more)

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

### Community 23 - "GEMINI.md"
Cohesion: 0.22
Nodes (8): Code Exploration, Credentials (Dev), Documentation, graphify, Sub-agent Communication, Test Execution, Testing, Token Optimization Rules

### Community 51 - "env.py"
Cohesion: 0.33
Nodes (8): do_run_migrations(), get_url(), Run migrations in 'offline' mode., In this scenario we need to create an Engine     and associate a connection with, Run migrations in 'online' mode., run_async_migrations(), run_migrations_offline(), run_migrations_online()

### Community 52 - "BroadcastEvent"
Cohesion: 0.20
Nodes (9): 1. Boot Infrastructure, 2. Apply Migrations & Seed DB, 3. Run Backend Integration & E2E Tests, 🏗️ Architecture & Service Infrastructure, 🔑 Development Credentials (Dev Seed), 🕌 Minbar Live — Project Handover & Status Snapshot, 🎯 Next Steps for Fresh Agent (Sprint 4 Execution Plan), ⚙️ Quick Start Commands for Resuming Environment (+1 more)

### Community 53 - "test_integration_e2e.py"
Cohesion: 0.18
Nodes (16): main(), Minbar Live — Integration Test Script Tests basic application features against r, Test Quran verse detection with Al-Fatiha., Test translation service with Islamic context., Test TTS synthesis (simulation mode)., Test alignment session lifecycle., Test that all service health endpoints respond., Test login flow with seed credentials. (+8 more)

### Community 54 - "websocket_hub/app/main.py"
Cohesion: 0.40
Nodes (4): Code Quality & Multi-Tenancy Validation, 🧪 Minbar Live — Sprint 1 Test Report, Test Credentials, Test Execution Summary

### Community 55 - "📊 Minbar Live — Project Progress Tracker"
Cohesion: 0.20
Nodes (10): Milestones, 📊 Minbar Live — Project Progress Tracker, Project Status: 🟢 Sprint 1 Active, Sprint 0 — Foundation ✅ COMPLETE, Sprint 1 — Backend Foundation, Sprint 2 — ML Pipeline, Sprint 3 — Voice & Real-Time, Sprint 4 — Frontends (+2 more)

### Community 56 - "Architecture Decision Records (ADRs)"
Cohesion: 0.22
Nodes (9): ADR-001: Monorepo Structure, ADR-002: Primary ASR Model, ADR-003: Voice Cloning Model, ADR-004: Multi-Tenancy Strategy, ADR-005: Translation LLM Strategy, ADR-006: Imam Voice Consent & GDPR, ADR-007: Docker Internal Port Strategy, ADR-008: Tenant ID SQL Injection Prevention (+1 more)

### Community 57 - "🛠️ External Skills & GitHub Repositories — Minbar Live"
Cohesion: 0.22
Nodes (9): 1. Islamic Content Resources, 2. ASR & Speech, 3. Voice Cloning & TTS, 4. Real-Time & WebSocket Infrastructure, 5. Frontend, 6. LLM Integration, 7. DevOps & Infrastructure, 8. Security (+1 more)

### Community 58 - "🐛 Minbar Live — Issues, Decisions & Bug Log"
Cohesion: 0.25
Nodes (7): ADR-009: Replace passlib with direct bcrypt, ADR-010: Pydantic Settings extra="ignore", Closed Issues, Issue Severity Scale, 🐛 Minbar Live — Issues, Decisions & Bug Log, Open Issues, Technical Debt Log

### Community 59 - "RedisPubSub"
Cohesion: 0.50
Nodes (3): How to Start the Application & Run Tests, 🎉 Live Application Test Results, 🚀 Minbar Live — E2E Application Test Report

### Community 61 - "TenantAuthMiddleware"
Cohesion: 0.50
Nodes (3): 🚀 Minbar Live — Multi-Agent Kickoff Prompt, Repository Location, The Prompt

### Community 63 - "🧪 Minbar Live — Sprint 2 Test Report"
Cohesion: 0.50
Nodes (3): 🧪 Minbar Live — Sprint 2 Test Report, Services Implemented, Test Execution Commands

## Knowledge Gaps
- **216 isolated node(s):** `name`, `version`, `private`, `src/frontend`, `dev` (+211 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 11 inferred relationships involving `TranslationEngine` (e.g. with `GlossaryManager` and `CohereProvider`) actually correct?**
  _`TranslationEngine` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `TranslationRequest` (e.g. with `TranslationEngine` and `CohereProvider`) actually correct?**
  _`TranslationRequest` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `BroadcastEvent` (e.g. with `ConnectionManager` and `EventRouter`) actually correct?**
  _`BroadcastEvent` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _216 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `quran_service/app/main.py` be split into smaller, more focused modules?**
  _Cohesion score 0.050505050505050504 - nodes in this community are weakly interconnected._
- **Should `api_gateway/app/main.py` be split into smaller, more focused modules?**
  _Cohesion score 0.13043478260869565 - nodes in this community are weakly interconnected._
- **Should `TranslationEngine` be split into smaller, more focused modules?**
  _Cohesion score 0.13297872340425532 - nodes in this community are weakly interconnected._