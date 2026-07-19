# 🐛 Minbar Live — Issues, Decisions & Bug Log

## Issue Severity Scale
- **P0:** Production outage / data loss / security breach — fix immediately
- **P1:** Major feature broken / significant performance regression — fix in current sprint
- **P2:** Minor feature issue / non-blocking bug — fix in next sprint
- **P3:** Nice to have / polish — backlog

---

## Open Issues

*No open issues yet. Issues will be logged here as development progresses.*

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

---

## Closed Issues

*None yet.*

---

## Technical Debt Log

| ID | Description | Impact | Priority |
|---|---|---|---|
| TD-001 | PostgreSQL full-text search → migrate to Meilisearch for session history | Medium | P3 |
| TD-002 | Evaluate AraVec embeddings for improved Quran semantic search vs. rapidfuzz | Medium | P2 |
| TD-003 | Implement audio chunking strategy for dialects other than MSA in ASR | High | P1 |
