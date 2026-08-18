# Graph Report - minbar-live  (2026-07-21)

## Corpus Check
- 112 files · ~22,490 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 666 nodes · 1009 edges · 52 communities (41 shown, 11 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 122 edges (avg confidence: 0.69)
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

## God Nodes (most connected - your core abstractions)
1. `TranslationEngine` - 26 edges
2. `TranslationRequest` - 22 edges
3. `3. Agent Task Breakdown` - 18 edges
4. `compilerOptions` - 16 edges
5. `AlignmentEngine` - 15 edges
6. `TranslationResponse` - 15 edges
7. `Base` - 14 edges
8. `TranslationConfig` - 14 edges
9. `TTSConfig` - 14 edges
10. `test_models_have_tablenames()` - 13 edges

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

## Communities (52 total, 11 thin omitted)

### Community 0 - "quran_service/app/main.py"
Cohesion: 0.08
Nodes (16): Path, Load the Quran corpus from JSON files., HadithMatcher, Path, Load the Hadith corpus from JSON files., Get a specific hadith by collection and number., Search for matches in the corpus., calculate_similarity() (+8 more)

### Community 1 - "api_gateway/app/main.py"
Cohesion: 0.07
Nodes (35): BaseHTTPMiddleware, Request, refresh_token(), create_access_token(), get_current_user(), get_password_hash(), Any, Verify a plain password against a bcrypt hash. (+27 more)

### Community 2 - "TranslationEngine"
Cohesion: 0.13
Nodes (23): TranslationEngine, GlossaryManager, get_glossary(), pregenerate(), translate_batch(), translate_segment(), CohereProvider, OllamaProvider (+15 more)

### Community 3 - "🕌 Minbar Live — Agent Context File (CLAUDE.md)"
Cohesion: 0.04
Nodes (43): 1. High-Level Architecture, 2.1 Core Services, 2.2 Data Stores, 2. Service Breakdown, 3. Database Schema (Key Tables), 4. WebSocket Protocol, 5. Latency Budget, 6. Multi-Tenancy Architecture (+35 more)

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
Cohesion: 0.07
Nodes (17): BaseSettings, LogRecord, QuranCorpus, Get a specific verse by surah and ayah number., Search for matches in the corpus., DetectionEngine, detect_hadith(), detect_quran() (+9 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 10 - "models.py"
Cohesion: 0.19
Nodes (24): DeclarativeBase, OAuth2PasswordRequestForm, get_me(), login(), Any, AsyncSession, main(), AuditLog (+16 more)

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
Cohesion: 0.17
Nodes (12): 📊 Current Progress, 🔗 Key External Resources, 📁 Key Files (Read These First), 🕌 Minbar Live — Agent Context File (CLAUDE.md), 🧠 Model Decisions (from ADRs in ISSUES.md), 🤖 Multi-Agent Protocol, 🚨 Non-Negotiable Rules (from AGENT_HARNESS.md), Orchestrator Rules (+4 more)

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

## Knowledge Gaps
- **197 isolated node(s):** `name`, `version`, `private`, `src/frontend`, `dev` (+192 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HadithMatcher` connect `quran_service/app/main.py` to `config.py`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `QuranCorpus` connect `config.py` to `quran_service/app/main.py`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `normalize_arabic()` connect `quran_service/app/main.py` to `config.py`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `TranslationEngine` (e.g. with `GlossaryManager` and `CohereProvider`) actually correct?**
  _`TranslationEngine` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `TranslationRequest` (e.g. with `TranslationEngine` and `CohereProvider`) actually correct?**
  _`TranslationRequest` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `AlignmentEngine` (e.g. with `ArabicNormalizer` and `AlignmentConfig`) actually correct?**
  _`AlignmentEngine` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _197 weakly-connected nodes found - possible documentation gaps or missing edges._