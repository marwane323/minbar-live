# Minbar Live — API & WebSocket Contract

**Status:** v0.2.1 (2026-08-19) — reconciled against the full 2026-08-19 bootstrap evidence: frontend API-call inventory (§5.0), verbatim `lib/types.ts`, `lib/api.ts`, `lib/auth.ts`, `lib/ws.ts`, `shared/models.py`, `shared/auth.py`, `shared/middleware.py`, `websocket_hub/app/*`, alembic migration 001, `ISSUES.md` (ADR-001…010), and the live AUD-010 investigation. Supersedes v0.1/v0.2 drafts.

> **Authority:** from merge onward, `src/frontend/src/lib/types.ts`, `lib/api.ts`, `lib/ws.ts`, and every backend `schemas.py` derive from this document. Deviation is a bug in the code unless this file is amended first via PR + ADR.

## 0. Changelog

**v0.1 → v0.2:** route inventory rewritten from the actual frontend call surface; login reconciled to the existing OAuth2 form; session lifecycle matched to `{action}` ∈ `start|pause|end` + `next`; voice upload route matched (`/api/voice-profiles/upload`); public join kept at `GET /api/sessions/{id}/public` with the AUD-015 upgrade.

**v0.2 → v0.2.1 (corrections from full file contents):**
- **ADR renumbering.** `ISSUES.md` already records ADR-001…010 (incl. ADR-006 voice consent, ADR-007 Docker ports, ADR-008 tenant_id injection prevention). New decisions are **ADR-011** (segment-table tenancy), **ADR-012** (pre-auth login lookup), **ADR-013** (wire naming). v0.2's numbers collided; fixed.
- **Wire naming reversed to snake_case.** v0.2 chose camelCase based on tooling output that had stripped underscores. Verbatim `types.ts` proves the frontend consumes snake_case throughout (`tenant_id`, `khutba_id`, `listener_count`, `created_at`). ADR-013 records: **wire = snake_case**, matching `types.ts` and DB columns; no alias layer.
- **Status enums aligned to `types.ts`:** khutba `draft|ready|translating|archived`; translation job `queued|processing|completed|failed`; segment kind `speech|quran|hadith|dua`; session `preparing|live|paused|ended` (unchanged).
- **Auth documented as-is vs target:** current login returns `{access_token, token_type}` only and `/api/auth/refresh` re-issues from a Bearer access token; the §2 target (user object, real refresh tokens) is the required end state.
- **Sessions:** `is_public` currently defaults `true` (IDOR-enabler, AUD-015) → contract flips default to `false` and adds `join_code` (migration 002).
- **Hub REST ingress** (`POST /api/session/{id}/broadcast`) removed from the public surface; services publish via Redis channels only (§4.5).

## 1. Conventions

- **Base path:** `/api` on the api_gateway (:8000). Health probes unversioned at `/health` per service.
- **Wire format:** JSON, **snake_case** field names (ADR-013). Timestamps ISO-8601 UTC. IDs are UUIDv4.
- **Error envelope (all non-2xx):**
  ```json
  { "error": { "code": "string_snake_case", "message": "human readable", "details": {}, "request_id": "uuid" } }
  ```
- **Tenancy invariant:** every query is tenant-scoped; `tenant_id` is always resolved **server-side** (JWT claim, or session row for public join). It is never accepted from client input for scoping — the `X-Tenant-ID` header fallback in `TenantAuthMiddleware` is removed. Every data-bearing route ships with ≥1 cross-tenant negative test (0 rows / 404).
- **Auth invariant:** no static-token comparisons anywhere (`token == "secret"` is a CI-grep-banned pattern). JWT `verify_token` + `require_role(...)` on every non-public route. `JWT_SECRET` has no code default; services fail fast at boot if unset.
- **Logging:** structured JSON only, with `tenant_id`, `session_id`, `request_id`. No `print()` in backend (currently clean — CI greps to keep it that way).
- **Languages:** `ar, en, fr, tr, ur, ms, id, bn, de, es` (per `SUPPORTED_LANGUAGES`).

## 2. Auth

Roles: `admin`, `imam`, `operator`, `listener` (anonymous, session-scoped).

### POST /api/auth/login
Public. **Rate-limited** (§6). **OAuth2 password form** (`application/x-www-form-urlencoded`): `username` (email), `password` — what NextAuth's credentials provider already posts.
```json
// 200 (target)
{ "access_token": "jwt", "refresh_token": "jwt", "token_type": "bearer", "expires_in": 900,
  "user": { "id": "uuid", "role": "admin|imam|operator", "tenant_id": "uuid", "full_name": "string" } }
```
**Delta from current code:** today login returns only `{access_token, token_type}` and the frontend calls `/api/auth/me` for identity. The target returns `user` inline; `/me` remains for session checks.

**Tenant resolution (AUD-010 path → ADR-012):**
1. Login is exempt from `TenantAuthMiddleware`; no `app.tenant_id` GUC is set.
2. The pre-auth user lookup runs through a **dedicated RLS-exempt path**: either (a) a `SECURITY DEFINER` function `lookup_user_for_auth(email)` returning only `{id, password_hash, tenant_id, role, full_name, is_active}`, or (b) a separate `auth_schema.users_lookup` table with a global policy. Choice recorded in ADR-012.
3. All RLS policies use `current_setting('app.tenant_id', true)` (missing_ok) so an unset GUC yields zero rows, never `unrecognized configuration parameter`.
4. The app DB role is **non-superuser, no BYPASSRLS** in dev/CI (new `minbar_app` role); superuser `minbar` is reserved for migrations. The silent-bypass behavior observed on 2026-08-19 (login succeeding only via superuser bypass) becomes impossible by construction; a **cross-tenant negative login test** proves 0 rows.

### POST /api/auth/refresh
Public. **Target:** refresh token in body; rotation invalidates the old token (requires a `refresh_tokens` table or denylist — migration 002).
```json
// Request  { "refresh_token": "jwt" }
// 200      { "access_token": "jwt", "refresh_token": "jwt", "token_type": "bearer", "expires_in": 900 }
```
**Delta from current code:** today the route re-issues an access token from a still-valid Bearer access token; no refresh-token model exists.

### GET /api/auth/me
Auth: any non-listener role. Returns the `user` object as in login. **Delta:** today it returns the raw JWT payload (`sub`, `email`, `role`, `tenant_id`); target returns the canonical `user` shape.

### Role matrix (mutating routes)
| Resource | admin | imam | operator | listener |
|---|---|---|---|---|
| users, mosque settings, audit-log | ✔ | – | – | – |
| glossary, stats | ✔ | read | read | – |
| khutbas CRUD / translate / detect | ✔ | ✔ (own tenant) | read | – |
| sessions create / lifecycle / next | ✔ | ✔ | ✔ | – |
| voice-profiles | ✔ | ✔ (own voice only) | – | – |
| public session join | – | – | – | ✔ (rate-limited) |

## 3. REST Resources

Paths below are the **actual paths the portals already call** (bootstrap §5.0). The backend implements exactly these.

### 3.1 Khutbas
- `GET /api/khutbas` — list (paginated, tenant-scoped). Roles: admin, imam, operator.
- `POST /api/khutbas` — create. Roles: admin, imam. **Request (actual):**
  ```json
  { "title": "string", "language": "ar", "content": "string (full manuscript)", "target_languages": ["en","fr"] }
  ```
  Server segments `content` into `khutba_segments` (`sequence_number`, `segment_type: "speech"`), pins `version=1`. → `201` khutba, `status: "draft"`.
- `GET /api/khutbas/{id}` — detail incl. segments + per-language translation status. Segment shape (aligns `types.ts` + DB):
  ```json
  { "id": "uuid", "sequence_number": 1, "text": "string", "segment_type": "speech|quran|hadith|dua",
    "quran_reference": {"surah": 2, "ayah_start": 255, "ayah_end": 255} | null,
    "hadith_reference": {"collection": "...", "number": "..."} | null,
    "translations": {"en": "..."}, "is_verified": {"en": true} }
  ```
  (`types.ts` renames `type: "text"` → `segment_type: "speech"`; `index` → `sequence_number`.)
- `POST /api/khutbas/{id}/detect` — runs Quran/Hadith detection over segments. Each candidate match is **validated against the verified corpus**: `text` must match the verse at `surah:ayah` after normalization, else the segment stays `speech` (`422 quran_text_mismatch` on manual `segment_type` overrides). Hand-authored Quran text is rejected by construction.
- `POST /api/khutbas/{id}/translate` — kicks off pre-translation for `target_languages` → `{ "job_id": "uuid" }`. Glossary entries are injected into the translation **prompt**; the no-op `apply_glossary` post-processing is removed.
- `GET /api/translation-jobs/{id}` — `{ "id", "khutba_id", "target_language", "status": "queued|processing|completed|failed", "segments_completed": 0, "segments_total": 1, "error": "string|null" }`. `segments_total` ≥ 1 in responses (the AUD-003 NaN guard stays in frontend, but the API never invites 0/0).
- `PUT /api/khutbas/{id}/segments/{segment_id}` — edit one segment (bumps khutba `version`; sessions pin `khutba_version`).
- `DELETE /api/khutbas/{id}` — soft delete; blocked while referenced by an active session.

### 3.2 Sessions
- `POST /api/sessions` — Roles: admin, imam, operator. **Request (actual union of both portals):**
  ```json
  { "title": "string", "khutba_id": "uuid", "languages": ["en","fr"], "mode": "manuscript|supervised|autopilot" }
  ```
  (`mode` is new; default `manuscript`. Khutba must be `status: "ready"`.) → `201` session in `preparing`, with `join_code` (unguessable, ≥8 chars; new column, migration 002) + QR payload. **`is_public` now defaults `false`** (AUD-015).
- `GET /api/sessions` — list; filters `status`, `date`. Items (matches `types.ts`): `{ "id", "title", "khutba_id", "khutba_title", "status": "preparing|live|paused|ended", "languages": [], "listener_count": 0, "current_segment_index": 0, "started_at", "ended_at", "created_at" }`.
- `GET /api/sessions/{id}` — detail incl. mode, languages, counts, `khutba_version`.
- `POST /api/sessions/{id}/{action}` — `action ∈ start|pause|end`. Each emits `session_status` on the WS events channel. `end` triggers summary generation. Invalid transition → `409 invalid_session_transition`.
- `POST /api/sessions/{id}/next` — operator advance to next manuscript segment (manuscript/supervised modes); emits `transcript` + per-language `translation`/`audio` for the released segment.
- `GET /api/sessions/{id}/summary` — post-session summary; `GET /api/sessions/{id}/summary/download?format=pdf|txt` — real file export (replaces the `alert()` placeholder in `session-summary.tsx`).

### 3.3 Public listener access
- `GET /api/sessions/{id}/public` — public, **rate-limited**, no auth. **(Actual frontend route — kept.)**
  ```json
  // 200
  { "session": { "id": "uuid", "title": "string", "status": "live|paused", "mode": "manuscript|supervised|autopilot", "languages": ["en"] },
    "listener_token": "jwt (session-scoped, exp <= session end + 15m)" }
  ```
  **AUD-015 fix:** the response never exposes `tenant_id`; the listener token carries `{ role: "listener", session_id, tenant_id }` and authorizes **only** `/ws/listener/{session_id}` for that session. 404 unless `is_public=true` and `status ∈ {live, paused}` — no existence oracle.

### 3.4 Voice profiles (consent-gated; GDPR Art. 9)
- `GET /api/voice-profiles` — tenant-scoped list; imam sees own only. Items: `{ "id", "imam_id", "status": "pending|processing|ready|failed|revoked", "consent": { "given_at": "iso8601", "ip": "...", "method": "...", "text_version": "..." }, "created_at": "iso8601" }`.
- `POST /api/voice-profiles/upload` — **(actual frontend route)** multipart: `audio` file + consent metadata fields. Roles: admin, imam (own voice).
  Required consent fields (reject `422 consent_required` if absent): `consent_given_at`, `consent_method` (`recorded_audio|signed_form`), `consent_text_version`, `revocable_notice_acknowledged=true`.
  Audio + embeddings encrypted at rest (SSE-KMS or equivalent); consent rows append-only. Persistence via the `VoiceProfile` model — the current in-memory dict is a P0 compliance defect (AUD-017). Migration 002 adds `consent_method`, `consent_text_version`, `consent_revoked_at` (the table already has `consent_given_at`, `consent_ip`).
- `POST /api/voice-profiles/{id}/consent/withdraw` — sets `consent_revoked_at`; **all future synthesis for this profile is blocked** (`409 consent_revoked`).
- `DELETE /api/voice-profiles/{id}` — GDPR Art. 17 erasure: purges DB rows + S3 objects (audio, embeddings, TTS cache) and returns an erasure receipt:
  ```json
  { "purged": ["db","s3_audio","s3_embeddings","tts_cache"], "completed_at": "iso8601" }
  ```
  Covered by an erasure E2E test.

### 3.5 Admin
- `GET|POST /api/admin/users`, `PATCH|DELETE /api/admin/users/{id}` — user management, tenant-scoped.
- `GET|POST /api/admin/glossary`, `PATCH|DELETE /api/admin/glossary/{id}` — `{ "term_arabic": "string", "term_transliteration": "string|null", "lang": "en", "preferred": "string", "forbidden": ["string"] }` (aligns `GlossaryEntry`).
- `GET /api/admin/stats` — dashboard counters per `MosqueStats` (`total_sessions`, `total_listeners`, `total_khutbas`, `active_imams`, `languages_used`, `avg_session_duration_minutes`, `avg_latency_ms`, `sessions_this_month`, `listeners_this_month`); real data or honest zeros.
- `GET /api/admin/audit-log` — append-only, tenant-scoped, filterable by actor/action/date (aligns `AuditLogEntry`).
- `GET|PUT /api/admin/mosque` — mosque profile (name, slug, branding, `settings.enabled_languages`, default models). **(PUT is the actual frontend verb.)**

### 3.6 Quran & Hadith (corpus-backed, read-only)
- `GET /api/quran/verses/{surah}/{ayah}` — from `quran_verses_cache` **only**:
  ```json
  { "surah": 2, "ayah": 255, "text_ar": "…", "text_source": "tanzil-uthmani-simple",
    "translations": { "en": { "text": "…", "source": "sahih_international" } },
    "provenance": { "corpus": "tanzil", "license": "CC-BY-3.0", "imported_at": "iso8601" } }
  ```
  404 if absent. No generation/completion/paraphrase path exists in code.
- `GET /api/hadith/lookup?collection=&number=` — `{ "collection", "number", "text_ar", "grade", "narrator_chain", "source" }`; grade/collection/number are mandatory display fields.

## 4. WebSocket Contract (single envelope)

### 4.1 Endpoints (hub :8006)
- `/ws/operator/{session_id}` — JWT (`admin|imam|operator`); tenant from token; session must belong to tenant. Replaces legacy `/ws/publish` (whose `token == "secret"` check is removed entirely).
- `/ws/listener/{session_id}` — listener token from §3.3; `tenant_id` derived **server-side** from the session row. No `tenant_id` query param anywhere (AUD-015). Language selection is a client→server subscribe message (§4.4), replacing the legacy post-accept config frame.

### 4.2 Envelope (both directions, all events)
```json
{ "type": "transcript|translation|audio|quran_verse|session_status|error",
  "session_id": "uuid", "tenant_id": "uuid (server-stamped)", "payload": {}, "ts": "iso8601" }
```
A client-sent `tenant_id` is ignored. **Compatibility note:** current `ws.ts` keys off `data.type` and forwards `data.payload`, so it consumes this envelope without structural changes; `types.ts`'s `WSMessage {type, payload, timestamp}` is updated to this envelope (`timestamp` → `ts`, plus `session_id`/`tenant_id`).

### 4.3 Event payloads
- `transcript` — `{ "segment_id": "uuid", "sequence_number": 1, "text_ar": "string", "source": "manuscript|asr_stream", "mode": "manuscript|supervised|autopilot", "verified": bool, "final": bool, "confidence": 0.0, "is_deviation": bool }`. `verified=true` only for manuscript or operator-confirmed segments; autopilot is always `verified=false` and badged AI-generated. (Supersedes `TranscriptPayload.segment_index`.)
- `translation` — `{ "segment_id": "uuid", "sequence_number": 1, "lang": "en", "text": "string", "source": "pretranslated|mt_live", "verified": bool }`
- `audio` — `{ "segment_id": "uuid", "sequence_number": 1, "lang": "en", "url": "signed-s3-url", "voice_profile_id": "uuid|null", "engine": "chatterbox-multilingual|none" }`
- `quran_verse` — `{ "segment_id": "uuid", "surah": 2, "ayah": 255, "text_ar": "…(corpus-verbatim)", "text_source": "tanzil-uthmani-simple", "translation": { "lang", "text", "source" }, "confidence": 0.0 }`. Emitted **only** at detector confidence ≥ precision-tuned threshold; otherwise content ships as plain `transcript`. A false `quran_verse` is a P0 defect; a miss is acceptable.
- `session_status` — `{ "status": "preparing|live|paused|ended", "mode": "…", "listener_count": 0 }`
- `error` — `{ "code": "string", "message": "string", "fatal": bool }`

### 4.4 Client→server messages (listener)
```json
{ "type": "subscribe", "payload": { "lang": "en", "audio_enabled": true } }
```

### 4.5 Backend pub/sub channels (Redis `redis.asyncio`, per AGENT-9 spec)
`{session_id}:transcript` · `{session_id}:translation:{lang}` · `{session_id}:audio:{lang}` · `{session_id}:events`
The hub is a thin relay: Redis channel → WS envelope. The in-process dict (`pubsub.py` "mock mode", single `hub_events` channel) is deleted. The hub's public REST ingress `POST /api/session/{id}/broadcast` is removed; services publish to Redis directly. `GET /api/hub/stats` stays (admin role).

### 4.6 Legacy migration rule
The two dead vocabularies — frontend `session_status/transcript_update/translation_update/audio_update` and hub `transcription/translation/alignment/quran_detection/tts_ready/session_start/session_end` — are replaced by §4.2–4.3 in one sweep. CI grep bans: `transcript_update`, `translation_update`, `audio_update`, `event_type`, `/ws/session/`, `/ws/publish`, `/ws/listen`, `token == "secret"`, `[Simulation`.

## 5. Type Derivation & Naming

- **ADR-013 (naming):** wire format is **snake_case**, matching the existing `types.ts` and DB columns; backend Pydantic models serialize directly (no alias generator). (v0.2's camelCase call was made on tooling output with stripped underscores and is reversed.)
- `lib/types.ts` and all `schemas.py` are generated from / hand-synced to this document; CI greps the event vocabulary and the banned legacy patterns above.
- `SIMULATION_MODE=true` may bypass engines for local dev but **never emits placeholder text to clients** — it emits nothing, or an `error`/`session_status` event. Currently the flag does not exist and simulation is the only mode (AUD-007) — P0.

## 6. Non-Functional Invariants

- **Rate limiting (AUD-018):** `slowapi` (or equivalent) — `/api/auth/login`, `/api/auth/refresh`, `/api/sessions/{id}/public`: 10 req/min/IP; authed API: per-user token bucket.
- **CORS (AUD-013):** explicit allowlist from env (`CORS_ALLOW_ORIGINS`), no wildcard with credentials.
- **Tokens:** access 15 min (`ACCESS_TOKEN_EXPIRE_MINUTES=15`, was 1440); refresh 30 days, rotating. `get_current_user` currently trusts the payload without a DB check — acceptable only at 15-min expiry; revocation list is future work.
- **RLS (AUD-010/014):** `minbar_app` non-superuser role for the app in dev/CI; policies use `current_setting('app.tenant_id', true)`; migration 002 adds `tenant_id` + RLS to `khutba_segments` and `segment_translations` **or** a rigorously enforced join-only DAL — choice recorded as **ADR-011**. `tenants` stays RLS-free by design (pre-auth resolution), documented in ADR-012.
- **Provenance:** every displayed verse traceable to `surah:ayah` in the verified corpus; provenance + license in `docs/QURAN_PROVENANCE.md` (Tanzil = CC-BY-3.0, verbatim only, attribution + link mandatory; `risan/quran-json` = MIT — record which ships).

## 7. Open Items Blocking v1.0

1. ADR-011 (segment-table tenancy), ADR-012 (login lookup path), ADR-013 (wire naming) — draft, decide, record in `ISSUES.md`.
2. ADR-005 conflict: `TranslationConfig.model_name` and `OllamaProvider` default to `aya-expanse:32b` while ADR-005 mandates `aya-expanse:8b` — fix code or supersede the ADR.
3. Migration 002 scope: `refresh_tokens`, `sessions.join_code` + `is_public` default flip, voice-profile consent columns, segment-table tenancy per ADR-011.
4. Remaining runtime verifications: AUD-017 delete/withdraw flow once implemented; full-stack E2E with all 9 app services running (2026-08-19 rerun reached only the gateway; quran-service :8005 down → `httpx.ConnectError`).
5. `ISSUES.md` append of the bootstrap results requires the byte-exact current file (report copy is formatting-mangled) — pending from local agent.
6. Audit findings AUD-024…027 (tests-of-mocks, graphify-out bloat, `create_services.py`, `turbo.json` stray `!`) — fold into Step 5 hygiene.