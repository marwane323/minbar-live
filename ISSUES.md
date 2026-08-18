# 🐛 Minbar Live — Issues, Decisions & Bug Log

## Issue Severity Scale
- **P0:** Production outage / data loss / security breach — fix immediately
- **P1:** Major feature broken / significant performance regression — fix in current sprint
- **P2:** Minor feature issue / non-blocking bug — fix in next sprint
- **P3:** Nice to have / polish — backlog

---

## Open Issues

### ISSUE-001: Sprint 4 Build Verification Pending (P1)
**Date:** 2026-08-18  
**Status:** Open  
**Description:** All Sprint 4 frontend code (66+ files across 4 portals) was written by parallel subagents. First `npm run build` failed on missing `@/components/ui/slider` — component was created but rebuild was interrupted before verification. Next session must run `npm run build` and fix any remaining TypeScript errors.  
**Resolution:** Run `npm run build` in `src/frontend/`, fix errors, mark as closed.

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

---

## Technical Debt Log

| ID | Description | Impact | Priority |
|---|---|---|---|
| TD-001 | PostgreSQL full-text search → migrate to Meilisearch for session history | Medium | P3 |
| TD-002 | Evaluate AraVec embeddings for improved Quran semantic search vs. rapidfuzz | Medium | P2 |
| TD-003 | Implement audio chunking strategy for dialects other than MSA in ASR | High | P1 |
| TD-004 | WebSocket hub tests hang — need async test client compatible with starlette WS | Low | P3 |

