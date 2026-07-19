# 📊 Minbar Live — Project Progress Tracker

## Project Status: 🟡 Scaffolding Phase

**Last Updated:** 2026-07-19  
**Current Sprint:** Sprint 0 — Foundation  
**Overall Completion:** 2%

---

## Sprint 0 — Foundation (Current)
**Goal:** Repository, documentation, and agent harness ready for AI-driven development

| Task | Status | Agent | Notes |
|---|---|---|---|
| Create GitHub repository | ✅ Done | — | minbar-live |
| Write main_prompt.md | ✅ Done | — | Master build prompt |
| Write AGENT_HARNESS.md | ✅ Done | — | Agent persona & rules |
| Write ARCHITECTURE.md | ✅ Done | — | System architecture |
| Write MODELS.md | ✅ Done | — | AI model selection |
| Write SKILLS.md | ✅ Done | — | External skill repos |
| Write PROGRESS.md | ✅ Done | — | This file |
| Write ISSUES.md | ✅ Done | — | Issues & ADR log |
| Write docs/UI_UX.md | ⬜ Pending | AGENT-10 | — |
| Write docs/API_SPEC.md | ⬜ Pending | AGENT-9 | — |
| Write docs/SECURITY.md | ⬜ Pending | AGENT-15 | — |
| Write docs/DEPLOYMENT.md | ⬜ Pending | AGENT-16 | — |

---

## Sprint 1 — Backend Foundation
**Goal:** Docker Compose running, DB schema migrated, auth working

| Task | Status | Agent | Acceptance Criteria |
|---|---|---|---|
| Monorepo scaffold | ⬜ Pending | AGENT-1 | `docker-compose up` passes health checks |
| PostgreSQL schema + migrations | ⬜ Pending | AGENT-2 | All migrations clean, seed data loaded |
| Multi-tenant auth (NextAuth + RLS) | ⬜ Pending | AGENT-3 | Cross-tenant isolation verified |
| FastAPI skeleton + OpenAPI docs | ⬜ Pending | AGENT-1 | `/docs` endpoint serves full spec |

---

## Sprint 2 — ML Pipeline
**Goal:** ASR + alignment + translation pipeline working end-to-end in test

| Task | Status | Agent | Acceptance Criteria |
|---|---|---|---|
| ASR service (Cohere + Whisper fallback) | ⬜ Pending | AGENT-4 | <800ms first-token on GPU |
| Alignment engine | ⬜ Pending | AGENT-5 | ≤2 segment drift on 30-min test |
| LLM translation service | ⬜ Pending | AGENT-6 | Terminology glossary respected |
| Quran verse detection | ⬜ Pending | AGENT-7 | ≥90% detection rate |
| Hadith detection | ⬜ Pending | AGENT-7 | Fuzzy match working |

---

## Sprint 3 — Voice & Real-Time
**Goal:** Voice cloning working, WebSocket broadcast tested at scale

| Task | Status | Agent | Acceptance Criteria |
|---|---|---|---|
| Imam voice profile setup | ⬜ Pending | AGENT-8 | 3-min sample → voice profile in <5min |
| TTS pre-generation pipeline | ⬜ Pending | AGENT-8 | All segments pre-generated before session |
| Live TTS for deviations | ⬜ Pending | AGENT-8 | <2s audio for unscripted segments |
| WebSocket broadcast hub | ⬜ Pending | AGENT-9 | 500 concurrent listeners tested |

---

## Sprint 4 — Frontends
**Goal:** All three portals functional end-to-end

| Task | Status | Agent | Acceptance Criteria |
|---|---|---|---|
| Imam preparation portal | ⬜ Pending | AGENT-10 | Full workflow in <15 min |
| Live operator portal | ⬜ Pending | AGENT-11 | All controls responsive during live session |
| Listener PWA | ⬜ Pending | AGENT-12 | <2s load on 4G, offline cache works |
| Admin portal | ⬜ Pending | AGENT-13 | All CRUD functional |

---

## Sprint 5 — Polish & Launch
**Goal:** Security audit, video captions, CI/CD, documentation

| Task | Status | Agent | Acceptance Criteria |
|---|---|---|---|
| Video captions feature | ⬜ Pending | AGENT-14 | 1hr video in <10min on GPU |
| Security hardening | ⬜ Pending | AGENT-15 | Zero critical CVEs |
| CI/CD pipeline | ⬜ Pending | AGENT-16 | Push → staging deploy in <5min |
| Documentation & onboarding | ⬜ Pending | AGENT-17 | New mosque onboards in <30min |

---

## Milestones

| Milestone | Target Date | Status |
|---|---|---|
| M1: Scaffold + Auth | Sprint 1 end | ⬜ |
| M2: ML Pipeline E2E | Sprint 2 end | ⬜ |
| M3: Internal Alpha (team test) | Sprint 3 end | ⬜ |
| M4: Closed Beta (3 mosques) | Sprint 4 end | ⬜ |
| M5: Public SaaS Launch | Sprint 5 end | ⬜ |

---

## Velocity Tracking

| Sprint | Planned | Completed | Velocity |
|---|---|---|---|
| Sprint 0 | 12 | 8 | 67% |
| Sprint 1 | — | — | — |
| Sprint 2 | — | — | — |
