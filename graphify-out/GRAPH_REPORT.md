# Graph Report - minbar-live  (2026-08-18)

## Corpus Check
- 196 files · ~42,636 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1112 nodes · 2044 edges · 102 communities (61 shown, 41 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 132 edges (avg confidence: 0.68)
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
- admin/page.tsx
- imam/page.tsx
- listen/page.tsx
- app/page.tsx
- session/page.tsx
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
- WSConnection
- components.json
- user-table.tsx
- Minbar Live UI/UX Design System
- operate/page.tsx
- ApiClient
- dependencies
- manifest.json
- next-auth.d.ts
- ApiError
- lucide-react
- next
- next-auth
- qrcode.react
- @radix-ui/react-avatar
- @radix-ui/react-checkbox
- @radix-ui/react-dropdown-menu
- @radix-ui/react-label
- @radix-ui/react-progress
- @radix-ui/react-scroll-area
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-slot
- @radix-ui/react-switch
- @radix-ui/react-tabs
- @radix-ui/react-tooltip
- react
- react-dom
- react-dropzone
- recharts
- sonner
- swr
- tailwind-merge
- @tiptap/extension-placeholder
- @tiptap/react
- @tiptap/starter-kit
- zustand

## God Nodes (most connected - your core abstractions)
1. `cn()` - 39 edges
2. `useApi()` - 28 edges
3. `TranslationEngine` - 26 edges
4. `TranslationRequest` - 22 edges
5. `Button` - 22 edges
6. `useMutation()` - 21 edges
7. `3. Agent Task Breakdown` - 18 edges
8. `BroadcastEvent` - 17 edges
9. `compilerOptions` - 16 edges
10. `AlignmentEngine` - 15 edges

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

## Communities (102 total, 41 thin omitted)

### Community 0 - "quran_service/app/main.py"
Cohesion: 0.05
Nodes (28): Path, QuranCorpus, Load the Quran corpus from JSON files., Get a specific verse by surah and ayah number., Search for matches in the corpus., DetectionEngine, HadithMatcher, Path (+20 more)

### Community 1 - "api_gateway/app/main.py"
Cohesion: 0.05
Nodes (53): ListenClient(), ListenClientProps, PublicSession, PageProps, QuranVerse(), QuranVerseProps, RTLText(), RTLTextProps (+45 more)

### Community 2 - "TranslationEngine"
Cohesion: 0.13
Nodes (23): TranslationEngine, GlossaryManager, get_glossary(), pregenerate(), translate_batch(), translate_segment(), CohereProvider, OllamaProvider (+15 more)

### Community 3 - "🕌 Minbar Live — Agent Context File (CLAUDE.md)"
Cohesion: 0.20
Nodes (10): 1. High-Level Architecture, 2.1 Core Services, 2.2 Data Stores, 2. Service Breakdown, 3. Database Schema (Key Tables), 4. WebSocket Protocol, 5. Latency Budget, 6. Multi-Tenancy Architecture (+2 more)

### Community 4 - "AlignmentEngine"
Cohesion: 0.11
Nodes (18): AlignmentEngine, align_websocket(), process_text(), ProcessInputRequest, BaseModel, WebSocket, start_session(), ArabicNormalizer (+10 more)

### Community 5 - "devDependencies"
Cohesion: 0.07
Nodes (27): autoprefixer, eslint, eslint-config-next, postcss, devDependencies, autoprefixer, eslint, eslint-config-next (+19 more)

### Community 6 - "ASRConfig"
Cohesion: 0.10
Nodes (15): ASREngine, CohereASREngine, ABC, # TODO: Load actual Cohere client or model here, # TODO: Load faster-whisper model here, WhisperASREngine, WebSocket, websocket_endpoint() (+7 more)

### Community 7 - "3. Agent Task Breakdown"
Cohesion: 0.06
Nodes (31): 0. Project Identity, 1.1 Imam Preparation Portal, 1.2 Live Operator / AV Portal, 1.3 Listener Portal (Mobile-first PWA), 1.4 Admin & Settings Portal, 1.5 Additional Features (SaaS-level), 1. Core Feature Requirements, 2. Technical Architecture Overview (+23 more)

### Community 8 - "config.py"
Cohesion: 0.05
Nodes (33): FastAPI, LogRecord, chunk_audio(), detect_silence(), preprocess_audio(), Voice activity detection using RMS energy.     Assumes raw_bytes is 16-bit PCM., Splits an audio stream into chunks of chunk_duration_ms.     Assumes raw 16-bit, Normalizes and resamples audio.     Assumes raw_bytes is a valid audio format (e (+25 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 10 - "models.py"
Cohesion: 0.05
Nodes (69): BaseHTTPMiddleware, BaseSettings, DeclarativeBase, OAuth2PasswordRequestForm, get_me(), login(), Any, AsyncSession (+61 more)

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
Cohesion: 0.10
Nodes (17): !, ^lint, .next/**, .next/cache/**, inter, metadata, notoNaskhArabic, Providers() (+9 more)

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

### Community 26 - "admin/page.tsx"
Cohesion: 0.19
Nodes (13): data, SessionsChart(), StatsCards(), SessionSummary(), SessionSummaryProps, Button, Card, CardContent (+5 more)

### Community 28 - "imam/page.tsx"
Cohesion: 0.15
Nodes (19): EditKhutbaPage(), TranslateKhutbaPage(), NewKhutbaPage(), SessionsPage(), VoiceSetupPage(), SessionListPage(), BrandingEditor(), GlossaryEditor() (+11 more)

### Community 29 - "listen/page.tsx"
Cohesion: 0.21
Nodes (6): JoinFlow(), QRCodeDisplay(), SessionControls(), SessionControlsProps, ButtonProps, buttonVariants

### Community 31 - "app/page.tsx"
Cohesion: 0.19
Nodes (6): adminNavItems, ImamLayout(), Home(), Sidebar(), SidebarItem, SidebarProps

### Community 32 - "session/page.tsx"
Cohesion: 0.18
Nodes (18): DialogContent, DialogDescription, DialogFooter(), DialogHeader(), DialogOverlay, DialogTitle, Input, InputProps (+10 more)

### Community 51 - "env.py"
Cohesion: 0.09
Nodes (22): RecentActivityList(), AudioPayload, AuditLogEntry, GlossaryEntry, HadithReference, KhutbaStatus, LanguageCode, Mosque (+14 more)

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
Nodes (10): Milestones, 📊 Minbar Live — Project Progress Tracker, Project Status: 🟡 Sprint 4 In Progress (Build Verification Pending), Sprint 0 — Foundation ✅ COMPLETE, Sprint 1 — Backend Foundation, Sprint 2 — ML Pipeline, Sprint 3 — Voice & Real-Time, Sprint 4 — Frontends (+2 more)

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

### Community 64 - "WSConnection"
Cohesion: 0.17
Nodes (4): createWSConnection(), WSConnection, WSConnectionOptions, WSEventHandler

### Community 65 - "components.json"
Cohesion: 0.14
Nodes (13): aliases, components, utils, rsc, $schema, style, tailwind, baseColor (+5 more)

### Community 66 - "user-table.tsx"
Cohesion: 0.44
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 67 - "Minbar Live UI/UX Design System"
Cohesion: 0.20
Nodes (9): Arabic Specialized Components, Color Palette, Components, Core UI Components, Interaction & Accessibility, Layout Components, Minbar Live UI/UX Design System, Overview (+1 more)

### Community 68 - "operate/page.tsx"
Cohesion: 0.31
Nodes (7): OperatePage(), AudioDeviceSelector(), LatencyMonitor(), Badge(), BadgeProps, badgeVariants, TranscriptPayload

### Community 70 - "dependencies"
Cohesion: 0.22
Nodes (9): class-variance-authority, clsx, @radix-ui/react-dialog, @radix-ui/react-popover, dependencies, class-variance-authority, clsx, @radix-ui/react-dialog (+1 more)

### Community 71 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 72 - "next-auth.d.ts"
Cohesion: 0.33
Nodes (5): JWT, next-auth, next-auth/jwt, Session, User

## Knowledge Gaps
- **332 isolated node(s):** `name`, `version`, `private`, `src/frontend`, `dev` (+327 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ASRConfig` connect `ASRConfig` to `config.py`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `TranslationEngine` (e.g. with `GlossaryManager` and `CohereProvider`) actually correct?**
  _`TranslationEngine` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `TranslationRequest` (e.g. with `TranslationEngine` and `CohereProvider`) actually correct?**
  _`TranslationRequest` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _332 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `quran_service/app/main.py` be split into smaller, more focused modules?**
  _Cohesion score 0.050505050505050504 - nodes in this community are weakly interconnected._
- **Should `api_gateway/app/main.py` be split into smaller, more focused modules?**
  _Cohesion score 0.050580997949419004 - nodes in this community are weakly interconnected._
- **Should `TranslationEngine` be split into smaller, more focused modules?**
  _Cohesion score 0.13297872340425532 - nodes in this community are weakly interconnected._