# 🐛 Minbar Live — Issues, Decisions & Bug Log

## Issue Severity Scale
- **P0:** Production outage / data loss / security breach — fix immediately
- **P1:** Major feature broken / significant performance regression — fix in current sprint
- **P2:** Minor feature issue / non-blocking bug — fix in next sprint
- **P3:** Nice to have / polish — backlog

---

## Open Issues

### ISSUE-001: Sprint 4 Build Verification (P1)
**Date:** 2026-08-18  
**Status:** Open — **VERIFIED FAILING 2026-08-19**  
**Description:** All Sprint 4 frontend code (66+ files across 4 portals) was written by parallel subagents. First `npm run build` failed on missing `@/components/ui/slider` — component was created but rebuild was interrupted before verification. Next session must run `npm run build` and fix any remaining TypeScript errors.  
**Resolution:** Run `npm run build` in `src/frontend/`, fix errors, mark as closed.  
**Update 2026-08-19 (local bootstrap run, evidence: `docs/bootstrap/BOOTSTRAP_FINDINGS_2026-08-19.md`):** `npm ci` PASS (548 pkgs; 11 vulnerabilities: 2 critical, 8 high). `npm run build` **exit 1**, `npx tsc --noEmit` **exit 2** with 4 errors: `admin/billing/page.tsx:30` (`indicatorColor` is not a `Progress` prop), `imam/khutba/[id]/translate/page.tsx:41` (`boolean | null` vs `boolean | undefined`), `components/session/session-controls.tsx:35` (`"preparing" | "paused"` vs `"ended"` — no overlap), `components/ui/slider.tsx:6` (`defaultValue` type). The Sprint 4 build has never compiled. Fix scheduled in mission Step 6 (AUD-001/002/003 batch); CI (Step 5) makes recurrence impossible.

### ISSUE-002: WebSocket contract broken in both directions (P0) — AUD-005/006/011/015
**Date:** 2026-08-19  
**Status:** Open — CONFIRMED by bootstrap probes  
**Description:** Frontend connects to `ws://…:8006/ws/session/{id}` (`session/[id]/operate/page.tsx`, `hooks.ts`); the hub exposes only `/ws/listen/{id}` (requires caller-supplied `tenant_id` — IDOR-enabler) and `/ws/publish/{id}` (gated by literal `token != "secret"`, `websocket_hub/app/main.py:76`). Envelopes disagree (`type` vs `event_type`), event vocabularies disagree (`transcript_update` vs `transcription`). No live flow can ever connect.  
**Resolution:** Implement `docs/API_SPEC.md` §4 (`/ws/operator/{id}` + `/ws/listener/{id}`, single envelope `{type, session_id, tenant_id, payload, ts}`, 6-event vocabulary, JWT auth, server-side tenant derivation). Mission Step 1.3.

### ISSUE-003: ML pipeline is simulation-only, with no kill switch (P0) — AUD-007/009
**Date:** 2026-08-19  
**Status:** Open — CONFIRMED  
**Description:** ASR engines return hardcoded Arabic via `_simulate_transcription`; TTS engines return 440/220 Hz sine waves; all 3 translation providers fall back to literal `[Simulation - X] Translated: …` strings (confidence 0.9); hub `RedisPubSub` is an in-process dict (`connect()` logs "mock mode"); `apply_glossary` is a no-op `return text`. `SIMULATION_MODE` appears 0 times — simulation is the ONLY mode, and placeholder text can reach congregations today.  
**Resolution:** Mission Step 3 (real faster-whisper / Chatterbox / redis.asyncio; fail loudly on provider failure; glossary as prompt injection; `SIMULATION_MODE=true` never emits placeholder text).

### ISSUE-004: Quran & Hadith corpora are skeletal (P0) — AUD-008
**Date:** 2026-08-19  
**Status:** Open — CONFIRMED  
**Description:** `quran.json` = 10 verses (Al-Fatiha 1–7, Al-Baqarah 1–2, 255), metadata = 10 surah rows, `hadith.json` = 2 entries. Requirement is the verified 6,236-verse corpus; the no-false-positive guarantee is untestable at this scale.  
**Resolution:** Mission Step 4 (load verified Tanzil/quran-json corpus into `quran_verses_cache`; provenance + license in `docs/QURAN_PROVENANCE.md`; `quran.json` demoted to test fixture).

### ISSUE-005: RLS silently bypassed — app DB role is superuser (P0) — AUD-010
**Date:** 2026-08-19  
**Status:** Open — CONFIRMED at runtime  
**Description:** Live rerun (PYTHONIOENCODING=utf-8, gateway on :8000): login/me/refresh all 200 OK — because role `minbar` is `rolsuper=t, rolbypassrls=t`. `TenantAuthMiddleware` exempts `/api/auth/login`, `get_db()` never sets `app.tenant_id`, and the `users` policy is skipped entirely. Under a non-superuser role the same flow would fail (`unrecognized configuration parameter "app.tenant_id"`) — policies lack `current_setting(..., true)`. Tenant isolation is currently decorative; login works only by accident.  
**Resolution:** Mission Step 2 + ADR-012 (below): non-superuser `minbar_app` role in dev/CI, `missing_ok=true` policies, dedicated RLS-exempt pre-auth lookup, cross-tenant negative test proving 0 rows.

### ISSUE-006: Security config — wildcard CORS, default JWT secret, no rate limiting (P1) — AUD-012/013/018
**Date:** 2026-08-19  
**Status:** Open — CONFIRMED  
**Description:** api_gateway: `allow_origins=["*"]` with `allow_credentials=True`. `JWT_SECRET` default `"supersecret_default_key_change_in_prod"` in `shared/config.py` (overridden in local `.env`, but any deployment that forgets it signs with a public secret). Zero rate limiting anywhere. `.env.example` omits `JWT_SECRET`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `SERVICE_NAME`, `NEXT_PUBLIC_API_URL`. Access-token default is 1440 min (24 h).  
**Resolution:** Mission Step 2.6 + `docs/API_SPEC.md` §6 (fail-fast secret, env docs, explicit CORS allowlist, slowapi limits, 15-min access tokens).

### ISSUE-007: Session manager & REST layer absent (P0) — AUD-004
**Date:** 2026-08-19  
**Status:** Open — CONFIRMED  
**Description:** `session_manager/app/main.py` is an 11-line health-only stub. The api_gateway serves only `/health` + login/refresh/me. The portals call 20 REST endpoint groups (`/api/khutbas…`, `/api/sessions…`, `/api/admin…`, `/api/voice-profiles…`) that 404 on every service.  
**Resolution:** Mission Step 1.2 — routers per `docs/API_SPEC.md` §3, every mutating route behind `require_role`, every query tenant-scoped, cross-tenant negative tests.

### ISSUE-008: Test harness cannot run the e2e suite (P1) — AUD-020/021/022/023
**Date:** 2026-08-19  
**Status:** Open — CONFIRMED  
**Description:** `tests/conftest.py` is a docstring stub; `pytest-asyncio` missing from the root env (2 failures); e2e uses `token` as a non-fixture parameter (4 errors); `test_integration_e2e.py` crashes on Windows cp1256 (emoji in `print`) before any test runs; middleware test calls a non-callable and swallows it. 15 tests do pass (auth, sprint1). No `.github/workflows/` exists.  
**Resolution:** Mission Step 5 (real conftest with sys.path, pytest-asyncio dep, TestClient middleware test, corrected e2e payloads, self-contained `make test`, CI workflow).

### ISSUE-009: Makefile targets broken / Windows dev gaps (P2)
**Date:** 2026-08-19  
**Status:** Open — CONFIRMED  
**Description:** `make seed` points to `scripts/seed.py` (real: `src/backend/shared/seed.py`); `make migrate` runs bare `alembic` without `cd`/PYTHONPATH; `make` unavailable on Windows; PYTHONPATH + `DATABASE_URL_SYNC` host overrides undocumented (GEMINI.md only); no Python lockfile; README never documents `.env.example` → `.env`; compose carries obsolete `version:` attribute.  
**Resolution:** Step 5 hygiene batch; fix targets, document the Windows path, pin Python deps.

---

## Architecture Decision Records (ADRs)

### ADR-001: Monorepo Structure
**Date:** 2026-07-19  
**Status:** Accepted  
**Context:** Decision between monorepo (all services in one repo) vs. polyrepo (one repo per service).  
**Decision:** Monorepo using Turborepo or Nx. Shared TypeScript types between frontend and backend. Single CI/CD pipeline.  
**Consequences:** Easier for small team; simpler dependency management. May need optimization for large-scale CI.  
**Alternatives considered:** Polyrepo (too complex for initial team), separate frontend/backend repos (no shared types).

### ADR-002: Primary ASR Model
**Date:** 2026-07-19  
**Status:** Accepted  
**Context:** Need best open-source Arabic ASR model with Apache/MIT license.  
**Decision:** CohereLabs/cohere-transcribe-arabic-07-2026 (Apache 2.0, 25.87% WER — best open Arabic ASR as of July 2026). Fallback: openai/whisper-large-v3-turbo (MIT).  
**Consequences:** Dependency on Cohere Labs maintaining the model. GPU required for real-time performance.  
**Alternatives considered:** Whisper-large-v3 (slightly higher WER), commercial APIs (cost, privacy concerns).

### ADR-003: Voice Cloning Model
**Date:** 2026-07-19  
**Status:** Accepted  
**Context:** Need zero-shot multilingual voice cloning with permissive license.  
**Decision:** Chatterbox Multilingual by Resemble AI (MIT, 23 languages, zero-shot, emotion control, built-in watermarking).  
**Consequences:** MIT license allows SaaS use. Watermarking good for legal compliance. Requires consent workflow for biometric data.  
**Alternatives considered:** XTTS-v2 (non-commercial license issue for SaaS), ElevenLabs API (vendor lock-in, cost).

### ADR-004: Multi-Tenancy Strategy
**Date:** 2026-07-19  
**Status:** Accepted  
**Context:** SaaS requires strict data isolation between mosque instances.  
**Decision:** Single PostgreSQL database with row-level security (RLS). All tables have `tenant_id`. Subdomain-based routing.  
**Consequences:** Simpler operations than database-per-tenant. RLS enforced at DB level is more secure than application-level only.  
**Alternatives considered:** Database-per-tenant (operational overhead), schema-per-tenant (PostgreSQL complexity).

### ADR-005: Translation LLM Strategy
**Date:** 2026-07-19  
**Status:** Accepted  
**Context:** Need high-quality Islamic context-aware translation with low latency.  
**Decision:** Pre-translate full Khutba script during preparation phase (zero latency during live). For unscripted deviations, use Ollama (aya-expanse:8b) locally with API fallback.  
**Consequences:** Dramatically reduces live latency. Deviations still have 1.5s LLM latency.  
**Alternatives considered:** Full live translation (too slow), cloud-only API (privacy + cost).

### ADR-006: Imam Voice Consent & GDPR
**Date:** 2026-07-19  
**Status:** Accepted  
**Context:** Voice cloning uses biometric-equivalent data under GDPR Article 9.  
**Decision:** Explicit opt-in consent with timestamp + IP logged. Voice profile encrypted at rest. Right to erasure implemented (DELETE /api/voice-profiles/{id} fully purges from DB + S3). Consent withdrawal stops all TTS generation for that Imam.  
**Consequences:** GDPR-compliant. Adds UI friction for voice setup. Worth it for legal safety.  
**Alternatives considered:** Implicit consent (illegal in EU), no voice cloning feature (loses key differentiator).

### ADR-007: Docker Internal Port Strategy
**Date:** 2026-07-20  
**Status:** Accepted  
**Context:** Backend services' Dockerfiles each use their architecture-defined port (8001–8007) internally. Docker-compose maps external ports to internal ports.  
**Decision:** Each service listens on its own unique port inside the container (matching ARCHITECTURE.md). Docker-compose maps `external:internal` with matching ports. Health checks target the actual internal port.  
**Consequences:** Consistent with ARCHITECTURE.md port table. Requires port mapping alignment between Dockerfile CMD and docker-compose.  
**Alternatives considered:** All services listen on port 8000 internally (simpler Dockerfiles, but loses traceability to architecture doc).

### ADR-008: Tenant ID SQL Injection Prevention
**Date:** 2026-07-20  
**Status:** Accepted  
**Context:** `set_tenant_context()` uses PostgreSQL `SET app.tenant_id` which does not support parameterized queries. Original implementation used f-string interpolation — a SQL injection vector.  
**Decision:** Validate `tenant_id` as a UUID before interpolation. `uuid.UUID()` parsing guarantees only hex+hyphens pass, making injection impossible.  
**Consequences:** Extra validation step on every request (negligible cost). Raises `ValueError` on invalid tenant_id format.  
**Alternatives considered:** Using a PL/pgSQL function with parameters (added DB dependency), using `quote_literal()` (PostgreSQL-specific, less portable).

---

## Closed Issues

*None yet.*

---

### ADR-009: Replace passlib with direct bcrypt
- **Date:** 2026-07-20
- **Decision:** Removed `passlib[bcrypt]` dependency. Using `bcrypt` directly for `hashpw/checkpw`.
- **Rationale:** passlib is unmaintained. bcrypt >4.1 enforces strict 72-byte limit; passlib's internal 255-char test string triggers `ValueError`. Direct bcrypt is simpler and reliable.
- **Impact:** `shared/auth.py` — `verify_password()` and `get_password_hash()` now use `bcrypt` directly.

### ADR-010: Pydantic Settings extra="ignore"
- **Date:** 2026-07-27
- **Decision:** Set `extra="ignore"` on the `Settings` model_config.
- **Rationale:** `.env` contains variables for multiple services (POSTGRES_USER, NEXTAUTH_SECRET, MINIO_ROOT_USER, etc.). Without `extra="ignore"`, any service importing shared config would fail with pydantic `extra_forbidden` errors for env vars not in its model.
- **Impact:** `shared/config.py` — all services now tolerant of extra env vars.

### ADR-011: Tenancy for khutba_segments & segment_translations (AUD-014)
- **Date:** 2026-08-19
- **Status:** PROPOSED (pending owner acceptance)
- **Context:** `khutba_segments` and `segment_translations` have no `tenant_id` and no RLS policy; isolation is only transitive via `script_id`/`segment_id`, so any direct query bypasses tenant scoping (confirmed live: `rowsecurity=f` on both tables).
- **Decision (proposed):** Add `tenant_id` (FK → tenants, NOT NULL, backfilled via parent join) + `ENABLE ROW LEVEL SECURITY` + tenant policy to both tables in migration 002. Denormalized tenancy keeps every table self-sufficiently scoped and keeps the RLS mental model uniform ("every business table carries tenant_id + policy"), at the cost of one redundant column per row.
- **Alternatives considered:** Rigorously enforced join-only data-access layer (no schema change, but enforcement moves to code discipline and every future query author must remember it — rejected as the more fragile option).
- **Impact:** migration 002 backfill; all segment queries remain tenant-scoped without join discipline; cross-tenant negative tests required at the route layer anyway.

### ADR-012: Pre-auth login lookup under RLS (AUD-010)
- **Date:** 2026-08-19
- **Status:** PROPOSED (pending owner acceptance)
- **Context:** Login runs before any tenant context exists, but `users` has an RLS policy keyed on `app.tenant_id`. Today login only works because the app role is a superuser with BYPASSRLS (ISSUE-005). A non-superuser role would fail on `current_setting('app.tenant_id')` with the GUC unset.
- **Decision (proposed):** (1) App connects as new non-superuser role `minbar_app` in dev/CI; superuser `minbar` reserved for migrations. (2) All policies use `current_setting('app.tenant_id', true)` (missing_ok) — unset GUC yields 0 rows, never an error. (3) The pre-auth credential lookup uses a `SECURITY DEFINER` function `lookup_user_for_auth(email)` (owned by the migration role, `EXECUTE` granted to `minbar_app`) returning only `{id, password_hash, tenant_id, role, full_name, is_active}`; it performs no data reads beyond the auth tuple. After password verification, normal requests set `app.tenant_id` from the JWT claim. `tenants` stays RLS-free by design (slug → id resolution is non-sensitive and pre-auth).
- **Alternatives considered:** (b) separate `auth_schema.users_lookup` table with global policy (more moving parts, sync risk); (c) keep superuser in dev (rejected — it is precisely how the bypass went unnoticed).
- **Impact:** migration 002 creates role + function; `api_gateway` login handler switches to the function; cross-tenant negative login test proves 0 rows across tenants.

### ADR-013: Wire naming convention (snake_case)
- **Date:** 2026-08-19
- **Status:** PROPOSED (pending owner acceptance)
- **Context:** The portals' `lib/types.ts` already consumes snake_case everywhere (`tenant_id`, `khutba_id`, `listener_count`, `created_at`), matching DB column names. An intermediate API_SPEC draft (v0.2) chose camelCase based on tooling output that had silently stripped underscores; verbatim file retrieval corrected this.
- **Decision (proposed):** Wire format is snake_case end-to-end. Backend Pydantic models serialize directly (no alias generator); `types.ts` stays as-is; mismatches are fixed in code (e.g., segment `type: "text"` → `segment_type: "speech"`, `index` → `sequence_number`), not in a casing layer.
- **Alternatives considered:** camelCase wire with `alias_generator=to_camel` (idiomatic JS, but introduces a permanent translation boundary and diverges from the shipped frontend).
- **Impact:** `docs/API_SPEC.md` §5 records this; CI grep guards the WS vocabulary and banned legacy patterns listed there.

---

## Technical Debt Log

| ID | Description | Impact | Priority |
|---|---|---|---|
| TD-001 | PostgreSQL full-text search → migrate to Meilisearch for session history | Medium | P3 |
| TD-002 | Evaluate AraVec embeddings for improved Quran semantic search vs. rapidfuzz | Medium | P2 |
| TD-003 | Implement audio chunking strategy for dialects other than MSA in ASR | High | P1 |
| TD-004 | WebSocket hub tests hang — need async test client compatible with starlette WS | Low | P3 |
| TD-005 | `get_current_user` trusts JWT payload without a DB liveness check — acceptable only with 15-min access tokens (API_SPEC §6); revisit with token revocation list | Medium | P2 |
