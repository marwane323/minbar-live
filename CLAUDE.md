# 🕌 Minbar Live — Agent Context File (CLAUDE.md)

> **Auto-loaded by Antigravity CLI (Gemini & Claude) as persistent context.**  
> This file is the single source of truth for any AI agent working on this repository.  
> Read this entire file before writing a single line of code.

---

## 🔑 Quick Identity

| Field | Value |
|---|---|
| **Product** | Minbar Live (منبر لايف) — *Every word of the Khutba, in every language* |
| **Type** | SaaS/PaaS — AI-powered live Khutba transcription, translation & dubbing |
| **Status** | Sprints 0, 1, 2, 3 complete (50%) → **Sprint 4 starting (AGENT-10 next)** |
| **Workspace** | `C:\Projects\Khutba\minbar-live` |
| **Language** | Python 3.11+ (backend/ML) · TypeScript/Next.js 14 (frontend) |
| **Graph** | `graphify-out/` — 606+ nodes, 885+ edges. Use `graphify query/path/explain` first |

---

## 📁 Key Files (Read These First)

| File / Directory | Purpose |
|---|---|
| [`prompts/`](./prompts/) | **Orchestration prompts, handovers & test reports** for Antigravity CLI agents |
| [`prompts/master_handover_prompt.md`](./prompts/master_handover_prompt.md) | **Sprint 4 kickoff prompt** — copy/load into fresh agent sessions |
| [`prompts/session_resume.md`](./prompts/session_resume.md) | Complete session state, seed credentials, and setup commands |
| [`main_prompt.md`](./main_prompt.md) | **Master build prompt** — 17 agent tasks, acceptance criteria, full feature specs |
| [`AGENT_HARNESS.md`](./AGENT_HARNESS.md) | Agent persona, behavioral rules, code style standards |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Full system architecture, DB schema, WebSocket protocol, latency budget |
| [`MODELS.md`](./MODELS.md) | AI model selection (ASR, TTS, LLM, Quran/Hadith detection) |
| [`SKILLS.md`](./SKILLS.md) | External GitHub repos to use — do NOT reinvent these |
| [`PROGRESS.md`](./PROGRESS.md) | Sprint tracker — update after EVERY completed task |
| [`ISSUES.md`](./ISSUES.md) | Bug log + Architecture Decision Records (ADRs) |

---

## 🏗️ Directory Structure

```
minbar-live/
├── prompts/                  # Handover prompts, kickoff files & test reports for AI agents
│   ├── master_handover_prompt.md
│   ├── minbar_live_multiagent_prompt.md
│   ├── session_resume.md
│   ├── sprint1_test_report.md
│   ├── sprint2_test_report.md
│   └── e2e_test_report.md
├── src/
│   ├── backend/              # FastAPI services (Ports 8000-8007)
│   │   ├── shared/           # DB models, RLS, auth, config
│   │   ├── api_gateway/      # Auth, routing, rate limiting (port 8000)
│   │   ├── asr_service/      # Real-time Arabic ASR (port 8001)
│   │   ├── alignment_service/# Script alignment engine (port 8002)
│   │   ├── translation_service/ # LLM translation (port 8003)
│   │   ├── tts_service/      # Voice cloning + TTS (port 8004)
│   │   ├── quran_service/    # Verse & Hadith detection (port 8005)
│   │   ├── websocket_hub/    # Real-time broadcast (port 8006)
│   │   ├── session_manager/  # Session lifecycle (port 8007)
│   │   └── worker/           # Celery async tasks
│   ├── frontend/             # Next.js 14 App Router (Port 3000)
│   │   └── src/app/
│   │       ├── imam/         # Imam preparation portal (AGENT-10)
│   │       ├── session/      # Live operator portal (AGENT-11)
│   │       ├── listen/       # Listener PWA (AGENT-12)
│   │       └── admin/        # Admin dashboard (AGENT-13)
├── docs/                     # Extended architecture & design documentation
├── graphify-out/             # AST & semantic knowledge graph
└── tests/                    # Integration & E2E tests
```

---

## 🤖 Multi-Agent Protocol

### Orchestrator Rules
- Read `main_prompt.md` **in full** before spawning any sub-agent
- Execute agents in order: AGENT-1 → AGENT-2 → ... → AGENT-17
- Parallelism allowed: AGENT-10, AGENT-11, AGENT-12, AGENT-13 can run concurrently after AGENT-9
- After each agent: validate acceptance criteria → update `PROGRESS.md` → log issues to `ISSUES.md`

### Sub-Agent Rules
- Each sub-agent works on ONE `[AGENT-N]` task only
- Branch naming: `feature/agent-N-description`
- Commit style: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`)
- NEVER write unscoped DB queries (always include `tenant_id`)
- NEVER generate/guess Quranic text — retrieve from `quran.json` corpus only
- ALWAYS update `PROGRESS.md` upon task completion

---

## ⚙️ Tech Stack Summary

| Layer | Tech |
|---|---|
| **Backend API** | FastAPI (Python 3.11+), Pydantic v2, SQLAlchemy, Alembic |
| **Frontend** | Next.js 14 (App Router), TypeScript strict, shadcn/ui, TailwindCSS |
| **Database** | PostgreSQL 16 + pgvector + Row Level Security |
| **Cache/Queue** | Redis 7 (pub/sub + Celery broker) |
| **Object Storage** | MinIO (dev) / S3 (prod) |
| **ASR** | CohereLabs/cohere-transcribe-arabic-07-2026 → fallback: faster-whisper |
| **LLM** | Ollama/aya-expanse:8b (local) → fallback: OpenAI/Cohere API |
| **TTS** | Chatterbox Multilingual (MIT, zero-shot, 23 languages) |
| **Auth** | NextAuth.js + JWT (tenant_id claim) + PostgreSQL RLS |
| **Infra** | Docker Compose (dev) → Kubernetes + Helm (prod) |

---

## 🚨 Non-Negotiable Rules (from AGENT_HARNESS.md)

1. **Islamic integrity:** Never mistranslate Islamic terms — transliterate, don't translate
2. **No Quran hallucination:** All Quranic text MUST come from verified `quran.json` corpus
3. **Security-first:** No SQL injection, XSS, IDOR, or auth bypass — even in test code
4. **Multi-tenancy always:** Every DB query scoped to `tenant_id` with RLS
5. **RTL support:** All Arabic text uses `dir="rtl"` + `Noto Naskh Arabic` font
6. **Structured logging:** JSON logs only — no `print()` statements
7. **Test coverage:** Every new function needs ≥1 unit test
8. **Graceful failure:** All WebSocket handlers handle disconnect/timeout/error

---

## 📊 Current Progress

- **Sprint 0 (Foundation):** ✅ Complete (architecture docs, harness, models)
- **Sprint 1 (Backend Foundation):** ✅ Complete (monorepo, Postgres RLS, 11 models, JWT auth)
- **Sprint 2 (ML Pipeline):** ✅ Complete (ASR, Alignment, Translation, Quran Detection, TTS)
- **Sprint 3 (Voice & Real-Time):** ✅ Complete (Chatterbox mock TTS, WebSocket Hub)
- **Sprint 4 (Frontends):** 🟡 **IN PROGRESS — AGENT-10 is next**

See [`PROGRESS.md`](./PROGRESS.md) for full sprint breakdown.

---

## 📝 AI Agent Prompt Handover Protocol (`./prompts/`)

When starting or resuming sessions in Antigravity CLI:
1. **Fresh Orchestrator Sessions:** Read [`prompts/master_handover_prompt.md`](./prompts/master_handover_prompt.md) to initialize the current sprint objective and context.
2. **Resuming Work:** Consult [`prompts/session_resume.md`](./prompts/session_resume.md) for current state, ports, test commands, and seed credentials.
3. **Multi-Agent Spawning:** When spawning sub-agents, give them self-contained instructions referencing their specific `[AGENT-N]` section from [`main_prompt.md`](./main_prompt.md).
4. **Preserving Knowledge Across Turns:** All new kickoff prompts, handovers, and milestone test reports must be persisted directly into `./prompts/` as `.md` files so they remain accessible across CLI sessions.

---

## 🧠 Model Decisions (from ADRs in ISSUES.md)

| Decision | Choice | Reason |
|---|---|---|
| Primary ASR | CohereLabs/cohere-transcribe-arabic-07-2026 | Best Arabic WER (25.87%), Apache 2.0 |
| Fallback ASR | openai/whisper-large-v3-turbo | MIT, battle-tested |
| Voice Cloning | Chatterbox Multilingual | MIT, 23 languages, zero-shot |
| LLM (local) | aya-expanse:8b via Ollama | Best multilingual open model |
| Multi-tenancy | PostgreSQL RLS | DB-level security > app-level only |
| Monorepo | Turborepo/Nx | Shared types, single CI |

---

## 🔗 Key External Resources

- Quran corpus: https://github.com/risan/quran-json (MIT)
- Hadith API: https://github.com/fawazahmed0/hadith-api (Unlicense)
- Quran translations: https://quranenc.com/api/
- Arabic ASR leaderboard: https://github.com/Natural-Language-Processing-Elm/open_universal_arabic_asr_leaderboard
- Chatterbox TTS: https://github.com/resemble-ai/chatterbox
