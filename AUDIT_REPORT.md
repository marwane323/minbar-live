# 🕌 Minbar Live — Independent Pre-Sprint Audit Report

**Repository:** `marwane323/minbar-live` @ `main` (`465b18d`)
**Audit date:** 2026-08-18 · **Auditor:** independent senior full-stack auditor
**Method note:** Repository is private; GitHub's code search/fetch layers do not index it, so all file contents were retrieved via commit-diff (`get_commit … full_patch`) against the head commit `465b18d2` ("feat: complete Sprints 0-3 and Sprint 4 frontend portals") plus directory listings. **355 files** changed in that single commit (118,062 additions). The execution sandbox had **no network access**, so no `npm ci`/`npm run build`/`pytest`/`docker compose` could be run. Every finding is tagged `[EXECUTED]` (sandbox static compile or my own run), `[STATIC]` (read from source), `[DOC-CLAIM]` (documentation only), or `UNVERIFIED` where noted.

---

## 1. Executive Summary

Minbar Live is an ambitious, well-documented monorepo whose **documentation describes a substantially more complete system than the code implements**. The repo structure is coherent (8 FastAPI services + shared + worker; 4 Next.js portals), the SQLAlchemy models and Alembic RLS migration are genuinely well-designed, and the frontend portal UI code is stylistically consistent. However, the audit found **the system cannot function as intended**: the ML pipeline services are all simulation/mock implementations (ASR returns hardcoded strings, TTS returns sine waves, the WebSocket hub's Redis pub/sub is an in-process mock, and the Quran corpus contains **10 verses**, not the 6,236 documented), and — most critically — the four Sprint-4 frontend portals call **~20 REST endpoint groups that do not exist on any backend service** (the API gateway implements only `/health` + 3 auth routes; there is no khutba/session/admin CRUD anywhere). The claimed "tests passing" reports are contradicted by code-level defects (a middleware test that calls a non-callable, an e2e test whose request bodies would 422). Auth itself is likely broken at runtime because the RLS policy on `users` blocks the login query before any tenant context exists.

**Top 3 risks:**
1. **Frontend↔backend contract failure (P0)** — every portal screen is backed by endpoints that don't exist; `listen` and `operate` connect to WebSocket paths the hub doesn't expose.
2. **Mock ML pipeline presented as done (P0 for product truthfulness)** — no real ASR/LLM/TTS/Redis; Quran detection works only against 10 bundled verses; full-corpus requirement unmet (religious-integrity risk).
3. **Auth + RLS deadlock & security gaps (P0/P1)** — login query runs under RLS with no tenant context; WS publish endpoint accepts literal `token == "secret"`; wildcard CORS with credentials; hardcoded default JWT secret; listener join exposes raw `tenant_id`.

**Verdict preview:** 🔴 DOES NOT WORK AS INTENDED (see §2).

---

## 2. VERDICT

# 🔴 DOES NOT WORK AS INTENDED

**Confidence:** **High** for contract/mismatch and mock-implementation findings (directly read from source); **Medium** for runtime/auth findings (RLS-login deadlock and test failures are code-evident but not executed — no network sandbox).

**What was EXECUTED vs STATIC-only:**
- `[EXECUTED]`: repository tree enumeration (355 files), full content retrieval of all first-party source, AST parse of representative Python modules, and a static contract cross-map (20 frontend endpoint groups vs 4 backend routes). No build/test/boot commands could be executed (offline sandbox) — **the Sprint-4 `npm run build` remains UNVERIFIED**, which is itself the open blocker recorded as ISSUE-001.
- `[STATIC]`: all backend services, frontend portals, shared package, migration, tests, configs, docs.
- `[DOC-CLAIM]`: all latency targets, test-pass counts, "Sprints 0–3 complete" claims.

---

## 3. Setup Correctness Scorecard

| Area | Status | Evidence | Notes |
|---|---|---|---|
| Repo structure | ✅ | `[STATIC]` | Matches docs: 8 services + `shared/` + `worker/`; 4 portals + `login/` + `api/`; `prompts/`(6), `tests/`(6), `docs/`, `graphify-out/` present. `src/infrastructure` & `src/ml_pipeline` are README-only stubs. |
| Env config | 🟡 | `[STATIC]` | `.env.example` (32 lines) covers DB/Redis/MinIO/ports but **omits `JWT_SECRET`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `NEXT_PUBLIC_API_URL`** (AUD-018). |
| Dependencies | 🟡 | `[STATIC]` | Per-service `pyproject.toml` present; **none are pinned** (`>=` ranges). `shared/pyproject.toml` still lists `passlib[bcrypt]` though ADR-009 removed it. Frontend pins only majors (`^`). `npm audit`/`pip-audit` UNVERIFIED (offline). |
| Frontend build | ❓ | `UNVERIFIED` | Build never run. `slider.tsx` exists and imports only `react` + `@/lib/utils` (no missing Radix dep) → reported blocker plausibly fixed `[STATIC]`; but ≥3 other likely build/type breaks found statically (AUD-001..003). |
| Backend boot | ❓ | `UNVERIFIED` | Dockerfiles/compose coherent; services are import-light mocks and would likely boot; but `quran_service` loads corpora at import (OK), and login flow likely deadlocks on RLS (AUD-010). `docker compose up` not runnable offline. |
| Tests | 🔴 | `[STATIC]` | Reported "16/16, 8/8, 4/4 pass" `[DOC-CLAIM]`; code shows ≥4 tests that cannot pass as written (AUD-020..023). No pytest fixtures (`conftest.py` is a docstring); PYTHONPATH ritual undocumented except in `GEMINI.md`. |
| Contracts (FE↔BE) | 🔴 | `[STATIC]` | **20 frontend REST groups → 0 implemented**; WS event names/paths mismatch on both sides (AUD-004..006). |
| Auth | 🔴 | `[STATIC]` | NextAuth v5 wired to gateway login/me ✓, but login likely blocked by RLS (AUD-010); WS publish token is literal `"secret"` (AUD-011); default JWT secret hardcoded (AUD-012). |
| RTL / Arabic | ✅ | `[STATIC]` | `rtl-text.tsx` (`dir="rtl"`), `quran-verse.tsx`, `globals.css` `.quran-verse/.hadith-text`, `tailwind.config.ts` `font-arabic`, root layout loads Noto Naskh Arabic. Clean. |
| PWA | 🟡 | `[STATIC]` | `public/manifest.json` valid but **icons `/icon-192x192.png`, `/icon-512x512.png` missing** from `public/`; **no service worker** (matches doc claim) (AUD-016). |
| Security | 🔴 | `[STATIC]` | Wildcard CORS + credentials (AUD-013); no rate limiting; RLS missing on `khutba_segments`/`segment_translations` (AUD-014); WS listener requires `tenant_id` query param (IDOR-enabler, AUD-015); GDPR deletion endpoint absent (AUD-017). |
| Docs | 🟡 | `[STATIC]` | Extensive and thoughtful, but multiple contradictions vs code (see §6). |

---

## 4. Findings

Severity: **P0** blocker · **P1** high · **P2** medium · **P3** low · **INFO** future. Effort: S/M/L.

### Phase 2 — Build & Boot (the unverified build)

- **AUD-001 · P2 · frontend/build · `src/frontend/src/lib/hooks.ts:115-123` · `[STATIC]`**
  `useWebSocket` registers `ws.on(...)` handlers on a connection created *inside* `useEffect`, but `on` reads `wsRef.current` at call time; in `listen-client.tsx` and `operate/page.tsx` the `useEffect(() => on(...))` subscription runs in the same commit **before** `wsRef.current` is set on first render → handlers attach to a possibly-null ref and the returned unsubscribe is `() => {}` no-op. Events still flow for components that call `on()` after connect, but early messages are dropped and unsubscribes leak. *Impact:* flaky live updates. *Fix:* make `useWebSocket` return a stable `on` that queues handlers until connect, or create the connection synchronously. *Effort:* S.

- **AUD-002 · P2 · frontend/build · `src/frontend/src/components/session/live-transcript.tsx:57` · `[STATIC]`**
  `<ScrollArea ref={scrollRef}>` — the custom `ScrollArea` forwards ref to `ScrollAreaPrimitive.Root`, but the code calls `activeEl.scrollIntoView` on an inner element while the scrolling container is the Radix `Viewport`, not Root; ref points at the wrong node (auto-scroll target mismatch). Not a build break, but the auto-scroll behavior is unreliable. *Fix:* ref the Viewport or use a plain div with `overflow-y-auto`. *Effort:* S.

- **AUD-003 · P2 · frontend/build · `src/frontend/src/app/imam/khutba/[id]/translate/page.tsx:44`** · `[STATIC]`
  `Math.round((job.segments_completed / job.segments_total) * 100)` divides by `segments_total` which can be `0` → `NaN%`/Infinity rendered; also `job.status === "processing"` guards a possibly-null `job` with `job &&` elsewhere but not consistently. *Fix:* guard `segments_total > 0`. *Effort:* S.
  > Build note: the reported blocker `@/components/ui/slider` **now resolves** — `components/ui/slider.tsx` exists (51 lines) and imports only `react` and `@/lib/utils` (both present); it intentionally avoids `@radix-ui/react-slider`, so no missing package. `[STATIC]`

### Phase 3 — Backend / Contract extraction

- **AUD-004 · P0 · contract · `src/backend/api_gateway/app/main.py:38-95` vs all portal pages · `[STATIC]`**
  The only HTTP backend routes are `GET /health`, `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me`. The frontend calls **20 endpoint groups** — `GET/POST /api/khutbas`, `GET /api/khutbas/{id}`, `POST /api/khutbas/{id}/detect`, `POST /api/khutbas/{id}/translate`, `PUT /api/khutbas/{id}/segments/{id}`, `GET /api/translation-jobs/{id}`, `GET/POST /api/sessions`, `GET /api/sessions/{id}`, `GET /api/sessions/{id}/public`, `POST /api/sessions/{id}/{start|pause|end|next}`, `GET /api/voice-profiles`, `POST /api/voice-profiles/upload`, `GET/PUT /api/admin/mosque`, `GET/POST/DELETE /api/admin/glossary[/{id}]`, `GET /api/admin/audit-log`, `GET /api/admin/stats`, `GET/DELETE /api/admin/users[/{id}]` — **none exist** (no service, not even `session_manager`, implements khutba/session/admin CRUD; `session_manager/app/main.py` is an 11-line health-only stub). *Impact:* every portal screen fails at runtime (401/404). *Fix:* implement a real REST layer (khutba/session/admin routers) in `api_gateway` or `session_manager` behind `require_role` + tenant scoping. *Effort:* L.

- **AUD-005 · P0 · contract/websocket · `src/frontend/src/lib/ws.ts`, portals vs `src/backend/websocket_hub/app/main.py:46-99` · `[STATIC]`**
  Frontend connects to `ws://…:8006/ws/listen/{id}?lang=…` and `…/ws/session/{id}`. The hub exposes only `/ws/listen/{session_id}` (requires **`tenant_id`** query param, not `lang`) and `/ws/publish/{session_id}` (requires `token`). There is **no `/ws/session/{id}`** route → the operator portal's core screen can never connect. Frontend listener omits `tenant_id` → hub's `Query(...)` returns 422 on connect. *Impact:* live flows dead. *Fix:* align paths/params; add `/ws/operator/{session_id}`; derive tenant server-side. *Effort:* M.

- **AUD-006 · P0 · contract/events · frontend `listen-client.tsx`, `live-text-view.tsx`, `live-audio-player.tsx` vs `websocket_hub/app/schemas.py:6` & `event_router.py` · `[STATIC]`**
  Frontend listens for event `type`s `session_status`, `transcript_update`, `translation_update`, `audio_update`. Backend `BroadcastEvent.event_type` is a `Literal["transcription","translation","alignment","quran_detection","tts_ready","session_start","session_end"]` and payloads are routed by `event_type`, but the emitted JSON has no top-level `type` field that `ws.ts` (`if (data.type) emit(data.type, …)`) expects — `ws.ts` keys off `data.type`, backend sends `event_type`. **Neither names nor envelope match.** *Impact:* listener UI receives nothing. *Fix:* define one envelope (`{type, payload, ts}`) and one event vocabulary shared between `BroadcastEvent` and `lib/types.ts`. *Effort:* M.

- **AUD-007 · P0 · mocks-as-features · `asr_service/app/engine.py:22-84`, `tts_service/app/engine.py:16-38`, `websocket_hub/app/pubsub.py:9-30` · `[STATIC]`**
  ASR `CohereASREngine`/`WhisperASREngine` are marked `# TODO: Load actual model` and return hardcoded Arabic strings after `asyncio.sleep`. TTS `ChatterboxEngine.synthesize` returns a **440 Hz sine wave** (`generate_sine_wave`) and `clone_voice` returns a fabricated `quality_score: 0.95`. Hub `RedisPubSub` never touches Redis — it's an in-process dict (`connect()` just sets a flag). Docs claim these are complete with passing tests. *Impact:* the product's core value (real transcription/dubbing/broadcast) does not exist. *Fix:* integrate faster-whisper / real Chatterbox / redis-py pub/sub behind the existing engine interfaces. *Effort:* L.

- **AUD-008 · P0 · quran integrity · `quran_service/app/data/quran.json` (62 lines) · `[STATIC]`**
  Corpus ships **10 verses** (Al-Fatiha 1–7, Al-Baqarah 1–2, 2:255) and 10 surah metadata rows. AGENT_HARNESS rule 9 + ARCHITECTURE require the verified 6,236-verse corpus; detection against anything else returns no match (or worse, the "no false positives" guarantee is untestable at scale). This is the highest-sensitivity area of the product. *Fix:* bundle the full Tanzil/quran-json corpus at build time (or load from `quran_verses_cache` table) and never hand-author verse text. *Effort:* M. (No *hardcoded* verse strings were found in source outside the JSON corpus and its translation mirror — good; the failure is corpus **incompleteness**, not hallucination.)

- **AUD-009 · P1 · translation · `translation_service/app/providers.py:60,93,127` & `engine.py:31-39` · `[STATIC]`**
  On any provider exception the code **silently substitutes** `result = f"[Simulation - …] Translated: {text}"` and reports `confidence: 0.9`. A live Khutba would broadcast the literal string "[Simulation - Ollama] Translated: …" to congregations. Also `glossary.apply_glossary` is a no-op stub (`return text`), so the documented terminology enforcement does nothing. *Fix:* fail loudly / fall back to a configured provider, never emit placeholder text; implement glossary injection into the prompt. *Effort:* M.

- **AUD-010 · P1 · auth/RLS deadlock · `shared/middleware.py:10-11` + `api_gateway/main.py:42-50` + Alembic `001` users policy · `[STATIC]`** (runtime effect UNVERIFIED)
  `/api/auth/login` is exempted from `TenantAuthMiddleware`, so `get_db()` runs with `tenant_context == ""` and never sets `app.tenant_id`. The `users` table has RLS `USING (tenant_id = current_setting('app.tenant_id')::UUID)`. On Postgres, `current_setting('app.tenant_id')` with the GUC unset **raises** (unrecognized parameter) unless the third arg `missing_ok=true` is used → the login `SELECT` fails or returns zero rows. The reported passing login test `[DOC-CLAIM]` implies the dev DB role is likely a superuser/`BYPASSRLS`, which would silently defeat RLS in dev and hide the bug. *Impact:* login broken under real RLS, or RLS silently bypassed — both bad. *Fix:* (a) make policies use `current_setting('app.tenant_id', true)` and add a `USING` fallback for the auth path; (b) run the app as a non-superuser role in dev/CI; (c) add a negative cross-tenant login test. *Effort:* M.

- **AUD-011 · P0 · security · `websocket_hub/app/main.py:80-84` · `[STATIC]`**
  Publish endpoint auth is `if token != "secret": close(1008)`. A hardcoded, guessable token gates who can inject events into a live broadcast. *Impact:* anyone can push fake "translations"/Quran content to listeners. *Fix:* validate JWT (`verify_token`) + `require_role("operator","imam")`; never compare to a literal. *Effort:* S.

- **AUD-012 · P1 · security · `shared/config.py:11` · `[STATIC]`**
  `JWT_SECRET: str = "supersecret_default_key_change_in_prod"` ships as a default and is absent from `.env.example`. Any deployment that forgets the env var signs tokens with a public secret. *Fix:* require it (no default) — `JWT_SECRET: str` (no `=`) so boot fails fast; add to `.env.example`. *Effort:* S.

- **AUD-013 · P1 · security · `api_gateway/app/main.py:30-36` · `[STATIC]`**
  `CORSMiddleware(allow_origins=["*"], allow_credentials=True, …)`. Browsers ignore `*` with credentials, but the combination is a misconfiguration smell and offers no origin restriction; there is also **no rate limiting** anywhere (main_prompt mandates 100 req/min public). *Fix:* explicit origin allowlist per tenant; add `slowapi`/gateway limiter. *Effort:* S.

- **AUD-014 · P1 · multi-tenancy · Alembic `001` (khutba_segments, segment_translations) · `[STATIC]`**
  These two tables have **no `tenant_id` and no RLS policy** (the migration comment admits it). Isolation is only transitive via `script_id`, so any direct query bypasses RLS — violating AGENT_HARNESS rule 3 and ADR-004. *Fix:* add `tenant_id` columns + policies, or enforce join-scoping in a data-access layer and document it. *Effort:* M.

- **AUD-015 · P1 · security/IDOR · `websocket_hub/app/main.py:46-50` + `listen-client.tsx:38` · `[STATIC]`**
  Listener join requires a caller-supplied `tenant_id` query param and there is no check that the `session_id` is public/ongoing; combined with `is_public` default true, any guessed session UUID + tenant UUID pair joins a room. *Fix:* resolve tenant from session server-side; require an unguessable join token for non-public sessions. *Effort:* M.

- **AUD-016 · P2 · PWA · `src/frontend/public/manifest.json` · `[STATIC]`**
  Manifest references `/icon-192x192.png` and `/icon-512x512.png` which are **absent** from `public/` (only `.gitkeep` + `manifest.json`), and no service worker exists (doc-acknowledged). *Fix:* add icons + a minimal SW/offline cache. *Effort:* S. (Service worker also INFO — future sprint.)

### Phase 5 — Rule compliance

- **AUD-017 · P1 · GDPR/biometric · `tts_service` (whole service) + `imam/voice-setup/page.tsx` · `[STATIC]`**
  ADR-006 mandates encryption at rest and a working `DELETE /api/voice-profiles/{id}` that purges DB+S3. The service stores profiles only in an in-memory dict (`voice_profile.py`), never persists consent (`consent_given_at`/`consent_ip` unused), never encrypts, and has **no delete/withdraw endpoint**. The UI collects a GDPR Art. 9 checkbox but there's no backend to honor it. *Fix:* persist via `VoiceProfile` model, encrypt S3 objects, implement delete-with-purge + consent-withdrawal that blocks TTS. *Effort:* M. (External guidance: EDPB Guidelines 02/2021 — voice is biometric data; explicit, revocable Art. 9(2)(a) consent required.)

- **AUD-018 · P2 · env config · `.env.example` vs `shared/config.py` · `[STATIC]`**
  Missing from example: `JWT_SECRET`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `NEXT_PUBLIC_API_URL` (used by `lib/api.ts`/`lib/auth.ts`). *Fix:* document all. *Effort:* S.

- **AUD-019 · P3 · logging · multiple · `[STATIC]`**
  Rule "no `print()` in backend" holds in `src/backend/**` (clean), but `tests/test_integration_e2e.py` and `create_services.py` use `print()` (acceptable for scripts) and several frontend modules use `console.error` (acceptable client-side). Structured JSON logging exists via `shared/logging.py`. No action beyond noting.

### Phase 7 — Tests & CI

- **AUD-020 · P2 · tests · `tests/test_integration_sprint1.py:99-133` · `[STATIC]`**
  `test_tenant_auth_middleware_skips_health` does `middleware = TenantAuthMiddleware(app)` then `await middleware(scope, receive, send)`. `TenantAuthMiddleware` extends `BaseHTTPMiddleware`, whose request entry point is `dispatch(request, call_next)` — it is **not** an ASGI `(scope, receive, send)` callable; calling it that way raises `TypeError`/`AttributeError`, which the test swallows with `except Exception: pass`. The test asserts nothing and cannot validate the skip behavior it claims. *Fix:* exercise via `TestClient(app)` with the middleware added. *Effort:* S.

- **AUD-021 · P2 · tests · `tests/test_integration_e2e.py` · `[STATIC]`**
  (a) Not pytest-collectible (`asyncio.run(main())` script). (b) `test_alignment` posts `{"segments": [...]}` but `AlignmentStartRequest` **requires** `script_id` → 422. (c) `process` posts `{"text": …}` but the endpoint expects `{"asr_text": …}` → 422. (d) `test_tts` posts `/api/tts/synthesize` **without** `voice_id`, which `TTSRequest` requires → 422; and posts `/api/voice/profile` without `audio_sample_url` → 422. So the documented "E2E passing" `[DOC-CLAIM]` is not reproducible from this code. *Fix:* correct payloads; wrap in pytest or keep as a documented manual script. *Effort:* M.

- **AUD-022 · P2 · tests · `tests/test_integration_sprint1.py:115-122` · `[STATIC]`** (runtime UNVERIFIED)
  `assert str(sess.executed) == f"SET app.tenant_id = '{valid_uuid}'"` — `set_tenant_context` passes a `sqlalchemy.text()` object; `str(TextClause)` does **not** reliably render to the raw SQL string across SQLAlchemy 2.x versions. Likely assertion failure. *Fix:* compare against `sess.executed.text`. *Effort:* S.

- **AUD-023 · P2 · tests/infra · `tests/conftest.py`, `Makefile`, `GEMINI.md` · `[STATIC]`**
  `conftest.py` is a bare docstring; tests import `from shared.models …` which only resolves if `PYTHONPATH=src/backend/shared` is set — a step documented **only** in `GEMINI.md` (PowerShell, absolute Windows path). `make test` runs bare `pytest tests/` → import error. `pytest-asyncio` is required by `@pytest.mark.asyncio` but is not in `shared/pyproject.toml`. *Fix:* proper `conftest.py` with `sys.path` insertion + `pyproject` `[tool.pytest.ini_options]`; add `pytest-asyncio`. *Effort:* S.

- **AUD-024 · P2 · tests/coverage · repo-wide · `[STATIC]`**
  Per-service unit tests exist (asr/alignment/translation/tts/quran/websocket_hub/shared) — reasonable breadth — but they **test the mocks**, not real models; there are no cross-tenant RLS tests that hit a real DB (only `test_tenant_isolation.py`, which requires a live DB and is not wired into CI). No frontend tests at all. CI: **no `.github/workflows/`** — AGENT-16 is future scope → record as INFO. *Effort:* M.

### Phase 1 — Config & housekeeping

- **AUD-025 · P3 · repo hygiene · `graphify-out/` (~57k lines), `.gemini/settings.json` · `[STATIC]`**
  Committed AST cache (`graphify-out/cache/…`, 3 dated snapshots) and a Windows-specific hook path (`C:/Users/zoubi/.../graphify.EXE`) in `.gemini/settings.json`; `graphify-out/` is not in `.gitignore`. Bloat + machine-specific leakage. *Fix:* gitignore caches, keep only `GRAPH_REPORT.md`. *Effort:* S.

- **AUD-026 · P3 · repo hygiene · `create_services.py` · `[STATIC]`**
  One-off Windows scaffold script with a hardcoded `C:\Projects\Khutba\…` path committed at root; its templates (e.g. 2-line `main.py`) no longer match the real services. Dead/misleading. *Fix:* delete or move to `scripts/`. *Effort:* S.

- **AUD-027 · P3 · build config · `turbo.json` · `[STATIC]`**
  `"outputs": [".next/**", "!", ".next/cache/**"]` contains a stray `"!"` entry (invalid glob). Harmless but sloppy. *Fix:* remove `"!"`. *Effort:* S.

---

## 5. Sprint 0–4 Acceptance Checklist (AGENT-1 … AGENT-13)

Legend: MET / PARTIAL / NOT MET / UNVERIFIABLE (+ evidence tag).

| Agent | Criterion (from `main_prompt.md`) | Score | Evidence |
|---|---|---|---|
| **AGENT-1** Scaffold | `docker-compose up` starts all services, health checks pass | **UNVERIFIABLE → likely PARTIAL** | Compose + Dockerfiles coherent `[STATIC]`, but boot not executed (offline) and several services are mocks (AUD-007). |
| **AGENT-2** DB schema & migrations | migrations run clean; seed data for a test mosque | **PARTIAL** | 11-table migration + RLS + seed present and well-formed `[STATIC]`; segments/translations lack RLS (AUD-014); run not executed. |
| **AGENT-3** Auth & multi-tenancy | Mosque A cannot access Mosque B data **under any circumstances** | **NOT MET** | RLS-login deadlock (AUD-010), WS publish `"secret"` (AUD-011), listener tenant param IDOR (AUD-015), missing RLS on 2 tables (AUD-014). `[STATIC]` |
| **AGENT-4** ASR | <800 ms first-token on GPU; <2 s CPU | **NOT MET** | Engine is a `asyncio.sleep` mock returning fixed text (AUD-007). Latency meaningless. `[STATIC]` |
| **AGENT-5** Alignment | ≤2 segment drift on 30-min test | **UNVERIFIABLE (impl. present)** | Sliding-window + rapidfuzz + drift correction implemented and unit-tested `[STATIC]`; no 30-min evidence. |
| **AGENT-6** LLM translation | Quran translations use official wording, not generic MT | **PARTIAL** | Official-translation path exists but only for 1:1 & 2:255 (`quran_translations.py`); glossary is a no-op (AUD-009); silent simulation fallback. `[STATIC]` |
| **AGENT-7** Quran/Hadith detection | ≥90% detection, no false positives | **NOT MET (at scale)** | Works against 10 bundled verses only (AUD-008); "no false positives" untestable. `[STATIC]` |
| **AGENT-8** Voice cloning & TTS | intelligible audio, MOS ≥ 3.5 | **NOT MET** | Sine-wave output, fake `quality_score: 0.95` (AUD-007); no real Chatterbox. `[STATIC]` |
| **AGENT-9** WebSocket broadcast | 500 concurrent listeners, <200 ms | **UNVERIFIABLE (not real)** | Pub/sub is in-process mock (AUD-007); tenant filter exists in manager `[STATIC]`; scale untested; TD-004 notes WS tests hang. |
| **AGENT-10** Imam portal | full prep workflow <15 min | **NOT MET (blocked)** | UI exists (7 pages/4 comps) but backend endpoints absent (AUD-004). `[STATIC]` |
| **AGENT-11** Operator portal | controls responsive during live | **NOT MET (blocked)** | UI exists but `/ws/session/{id}` route missing (AUD-005). `[STATIC]` |
| **AGENT-12** Listener PWA | <2 s on 4G, offline cache | **NOT MET (blocked)** | No SW (AUD-016); WS contract mismatch (AUD-005/006); endpoint `/api/sessions/{id}/public` absent (AUD-004). |
| **AGENT-13** Admin portal | all CRUD functional, charts render | **NOT MET (blocked)** | UI exists; `/api/admin/*` endpoints absent; `sessions-chart` uses hardcoded data. `[STATIC]` |

**Sprint roll-up:** Sprint 0 ✅ MET (docs/harness). Sprints 1–3 are marked "complete" in `PROGRESS.md` but, on evidence, are **PARTIAL at best** (foundations exist; the ML pipeline is simulated). Sprint 4 is **code-written but functionally blocked** by missing backend endpoints and broken WS contract.

---

## 6. Documentation Drift (doc-vs-reality contradictions)

1. **Sprint-4 status conflict** — `CLAUDE.md` (§Current Progress): "Sprint 4 🟡 IN PROGRESS — AGENT-10 is next" **vs** `PROGRESS.md`/`ISSUES.md`/`prompts/session_resume.md`: "Sprint 4 code 100% written, build verification pending." `[STATIC]` (Contradiction confirmed — exactly the one flagged in the audit brief.)
2. **"Tests passing" claims vs code** — `prompts/sprint1_test_report.md` ("16/16"), `sprint2_test_report.md`, `e2e_test_report.md` ("Admin login PASS", "Quran detection PASS") `[DOC-CLAIM]` contradict AUD-010/020/021/022 (login under RLS, broken middleware test, 422 payloads). `[STATIC]`
3. **ADR-005 vs translation default** — ADR-005 mandates **aya-expanse:8b** via Ollama; `TranslationConfig.model_name` defaults to **aya-expanse:32b** and `OllamaProvider` also defaults to 32b. `[STATIC]`
4. **ADR-009 vs dependency** — ADR-009: "Removed `passlib[bcrypt]`"; `shared/pyproject.toml` still lists `passlib[bcrypt]`. `[STATIC]`
5. **AGENT-9 channel spec vs hub** — `main_prompt.md` channels `{session_id}:transcript|translation:{lang}|audio:{lang}|events` are **not implemented**; hub uses a single in-process `"hub:events"` channel. `[STATIC]`
6. **README repo-map vs tree** — README shows `src/ml_pipeline` & `src/infrastructure` as populated; both are README-only stubs. `[STATIC]`
7. **Cohere ASR model** — Docs (ADR-002/MODELS.md) cite `CohereLabs/cohere-transcribe-arabic-07-2026` "25.87% WER, best open Arabic ASR (July 2026)" — **UNVERIFIED** and likely aspirational; the ASR service never loads any model regardless (AUD-007).
8. **`ISSUES.md` open-issue count** — ISSUE-001 (build unverified) is the only open issue; the far more severe contract/mocks gaps found here are not logged. `[STATIC]`

---

## 7. Recommended Action Plan (P0 first)

1. **Define the API contract first (blocks everything).** Write `docs/API_SPEC.md` enumerating the 20 endpoint groups + one WS envelope; generate OpenAPI from FastAPI and share TS types. → resolves AUD-004/005/006 root cause. *(L)*
2. **Fix auth & RLS before any data work.** Non-superuser dev role; `current_setting(..., true)`; login path that resolves tenant from user's email domain or a tenant-slug claim *before* RLS-filtered queries; cross-tenant negative tests. → AUD-010/014/015. *(M)*
3. **Replace the WS publish token with JWT** and implement the documented channel naming. → AUD-011 + AGENT-9 spec. *(S/M)*
4. **Implement the missing REST routers** (khutbas, sessions lifecycle, voice-profiles, admin CRUD, stats, audit-log, glossary) in `api_gateway`/`session_manager` with `require_role` + tenant scoping; persist voice profiles; add GDPR delete-with-purge. → AUD-004/017. *(L)*
5. **Swap mocks for real engines behind the existing interfaces:** faster-whisper (ASR), real Chatterbox (TTS), `redis.asyncio` pub/sub (hub). Keep simulation only behind an explicit `SIMULATION_MODE` flag that never ships placeholder text to clients. → AUD-007/009. *(L)*
6. **Load the full verified Quran corpus** (Tanzil/quran-json, 6,236 verses) into `quran_verses_cache`; never hand-author verse text; add a provenance/license note. → AUD-008. *(M)*
7. **Verify the Sprint-4 build:** `cd src/frontend && npm ci && npm run build && npx tsc --noEmit`; fix AUD-001/002/003; add PWA icons + service worker. → AUD-001/002/003/016 + ISSUE-001. *(M)*
8. **Repair the test harness:** real `conftest.py` (sys.path), `pytest-asyncio` dep, fix AUD-020/021/022, make `make test` self-contained, add a GitHub Actions CI (lint+typecheck+pytest+build). → AUD-020..024 (+INFO CI). *(M)*
9. **Security pass:** non-`@*` CORS, rate limiting, remove default JWT secret, document env vars. → AUD-012/013/018. *(S)*
10. **Repo hygiene:** gitignore `graphify-out/cache`, remove `.gemini` machine paths, delete `create_services.py`, fix `turbo.json`. → AUD-025/026/027. *(S)*

---

## 8. Appendix — Commands run & environment limits

| # | Command / call | Result | Exit |
|---|---|---|---|
| 1 | `get_file_contents` (repo root, all dirs) | 355-file tree enumerated | n/a (tool) |
| 2 | `get_commit 465b18d … detail=full_patch` (paginated ×~25 pages) | full source retrieved for all first-party files | n/a (tool) |
| 3 | `fetch_url raw.githubusercontent.com/...` | **FAILED** — private repo, no raw access | env-limit |
| 4 | `search_code repo:marwane323/minbar-live` | **0 results** — repo not indexed | env-limit |
| 5 | `execute_python: ast.parse(...)` on shared/config, database, api_gateway/main, translation/providers | all parsed OK | 0 |
| 6 | `execute_python: FE/BE contract cross-map` | 20 frontend groups vs 4 backend routes | 0 |
| 7 | `npm ci / npm run build` in `src/frontend` | **NOT RUN** — sandbox has no network/Docker | UNVERIFIED |
| 8 | `pytest` (backend suites) | **NOT RUN** — offline; would also need `PYTHONPATH` + `pytest-asyncio` | UNVERIFIED |
| 9 | `docker compose -f docker-compose.dev.yml up` | **NOT RUN** — no Docker in sandbox | UNVERIFIED |
| 10 | `npm audit` / `pip-audit` | **NOT RUN** — offline | UNVERIFIED |
| 11 | `search_web` (Quran corpus, spf.io analog, GDPR voice) | domain research for next-agent prompt | 0 |

**Environment-limit note:** items 3–4 and 7–10 failed due to sandbox restrictions, **not** code defects; they are recorded as UNVERIFIED and must be re-run in a networked environment to close the build/test/boot questions (especially the Sprint-4 frontend build).
