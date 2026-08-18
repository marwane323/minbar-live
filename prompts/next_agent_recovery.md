# 🕌 Minbar Live — Next-Agent Recovery & Hardening Mission

> **How to use:** Paste this entire prompt into a fresh orchestrating-agent session.
> **Load order:** `AUDIT_REPORT.md` (repo root, committed on branch `docs/audit-2026-08-18`) → `CLAUDE.md` → `PROGRESS.md` → `main_prompt.md` → `AGENT_HARNESS.md` → `ISSUES.md`.
> This prompt **supersedes** `prompts/session_resume.md` for Sprint 4 recovery.

---

## 0. Ground Truth — Read Before Anything Else

An independent audit (`AUDIT_REPORT.md`, 2026-08-18) found that **the repository is not where the docs say it is**. Sprints 0–3 built solid *foundations* (schema, RLS migration, auth scaffolding, service skeletons, consistent portal UIs), but:

- The four Sprint-4 portals call **~20 REST endpoint groups that no backend implements** (AUD-004). The API gateway serves only `/health` + login/refresh/me.
- The WebSocket contract is broken in **both directions**: wrong paths (`/ws/session/{id}` doesn't exist), wrong query params (`lang` vs required `tenant_id`), wrong event names (`transcript_update` vs `transcription`), wrong envelope (`type` vs `event_type`) (AUD-005/006).
- The ML pipeline is **simulated**: ASR returns hardcoded strings, TTS returns sine waves, the hub's "Redis pub/sub" is an in-process dict (AUD-007).
- The Quran corpus is **10 verses**, not 6,236 (AUD-008).
- Login likely deadlocks against RLS (or dev is silently bypassing RLS as superuser) (AUD-010).

**Your job is not "polish." Your job is to make the system actually work — and to make it worthy of the trust a congregation places in it.**

---

## 1. Bootstrap — Run First, Report Real Output

Do not write a line of code until you have run these and pasted the real output into `ISSUES.md`:

```bash
# 1. Close ISSUE-001 — the never-verified Sprint 4 build
cd src/frontend && npm ci && npm run build && npx tsc --noEmit

# 2. Boot the infra and seed
docker compose -f docker-compose.dev.yml up -d postgres redis minio
cd src/backend/shared && python -m alembic upgrade head && cd ../../..
python src/backend/shared/seed.py

# 3. Run the E2E script — EXPECT failures at login/RLS and 422 payload bugs (AUD-021)
python tests/test_integration_e2e.py
```

Record what actually happens. If it contradicts this prompt or the audit, trust your eyes and log it.

---

## 2. Why the Quality Bar Is Different Here

This is not a normal SaaS. Three constraints dominate every decision:

1. **Religious integrity is P0, always.** A mistranslated or hallucinated Quranic verse broadcast to hundreds of listeners is not a "bug" — it is a harm. Therefore:
   - **Never** generate, paraphrase, or "complete" Quranic Arabic. Verse text comes only from a verified corpus (Tanzil / quran-json / Quran.com API) with a recorded provenance and license note.
   - Quran **translations** come only from established scholarly translations (e.g., Sahih International, Muhsin Khan, Dr. Mustafa Khattab) — never from the live LLM path.
   - Any segment the detector is unsure about is shown as *speech*, never guessed as Quran. **Precision over recall**: a missed highlight is acceptable; a false "Quran" label is not.
2. **Voice is biometric data.** Under GDPR Art. 9 (EDPB Guidelines 02/2021), an Imam's voice print requires **explicit, recorded, revocable consent** (Art. 9(2)(a)), encryption at rest, and a working right-to-erasure (Art. 17) that purges DB + object storage and stops all future TTS for that Imam. No consent record → no voice feature.
3. **Live means live — but honest.** Borrow the operating-model taxonomy proven by worship-translation platforms (e.g., spf.io): **Manuscript mode** (pre-loaded script → pre-translated, ~0 ms, highest quality — Minbar's differentiator), **Supervised mode** (operator confirms/edits before release), **Autopilot mode** (fully live ASR→MT, clearly badged as AI-generated). Never present Autopilot output as verified. Latency targets (ARCHITECTURE.md §5) apply to the *scripted* path; the deviation path must degrade gracefully and visibly.

---

## 3. Mission — Ordered Work Plan (HARD GATE: no step N+1 until step N is green)

### Step 1 — Contract first (P0; blocks ALL else)
1. Write `docs/API_SPEC.md`: every REST route (method, path, auth role, request/response schema) and the **single WebSocket envelope** `{type, session_id, tenant_id, payload, ts}` with one event vocabulary (`transcript`, `translation`, `audio`, `quran_verse`, `session_status`, `error`). Frontend `lib/types.ts` and backend Pydantic schemas must derive from this one source.
2. Implement the missing routers (khutbas, sessions lifecycle incl. `/public` join, voice-profiles, admin users/glossary/stats/audit-log/mosque) in `api_gateway`/`session_manager`; every query tenant-scoped; every mutating route behind `require_role`. → AUD-004.
3. Align the WS hub: add `/ws/operator/{session_id}`; derive tenant server-side on listener join; rename events to the shared vocabulary; replace `token == "secret"` with JWT `verify_token` + role check. → AUD-005/006/011/015.

### Step 2 — Auth & tenancy that actually hold (P0/P1)
4. Run the app DB role as **non-superuser** in dev/CI so RLS is real; use `current_setting('app.tenant_id', true)`; give login a documented, safe tenant-resolution path before RLS-filtered reads; add a **cross-tenant negative test** that must return 0 rows. → AUD-010.
5. Add `tenant_id` + RLS to `khutba_segments` and `segment_translations` (or a rigorously enforced join-only data-access layer — log the choice as an ADR). → AUD-014.
6. Remove the default JWT secret (fail fast if unset); document all env vars in `.env.example`; restrict CORS to an explicit allowlist; add rate limiting on public endpoints. → AUD-012/013/018.

### Step 3 — Real engines behind the existing interfaces (P0)
7. ASR: integrate `faster-whisper` (whisper-large-v3-turbo) as the working engine; keep the documented Cohere option behind a provider interface. Simulation only behind `SIMULATION_MODE=true`, which **never** emits placeholder text to clients. → AUD-007.
8. TTS: integrate real Chatterbox Multilingual; persist voice profiles via the `VoiceProfile` model with consent fields; implement `DELETE /api/voice-profiles/{id}` (purge DB + S3) and consent-withdrawal that blocks synthesis. → AUD-007/017.
9. Hub: replace the in-process mock with `redis.asyncio` pub/sub using the documented channels `{session_id}:transcript|translation:{lang}|audio:{lang}|events`. → AUD-007 + AGENT-9 spec.
10. Translation: implement the glossary as **prompt injection** (not the no-op `apply_glossary`); on provider failure, raise/route to fallback — never emit "[Simulation]" text; default local model to `aya-expanse:8b` per ADR-005 (or supersede the ADR). → AUD-009.

### Step 4 — Quran & Hadith integrity (P0, sensitivity-critical)
11. Load the **full verified Quran** (6,236 verses; Tanzil/quran-json, MIT) into `quran_verses_cache` at migration/seed time; keep `quran.json` only as a test fixture. Add provenance + license to `docs/`. → AUD-008.
12. Tune detection for precision; add a test set of common Khutba verses *and* common non-Quranic Arabic phrases; report precision/recall in the test report. No false "Quran" labels tolerated.
13. Hadith: load from the self-hostable hadith-api corpus; always display grade + collection + number.

### Step 5 — Honest tests, then CI
14. Fix the harness: real `conftest.py` (path setup), add `pytest-asyncio`, fix the middleware test (use `TestClient`), fix the e2e payloads (AUD-020/021/022), make `make test` self-contained. → AUD-020..023.
15. Add `.github/workflows/ci.yml`: lint, `tsc --noEmit`, `pytest`, `npm run build`, docker-compose smoke test. (Pulls AGENT-16 forward — the Sprint-4 build must never again go unverified.)

### Step 6 — Only now: UX & PWA polish
16. Fix the WS hook race, ScrollArea ref, NaN progress (AUD-001/002/003); add PWA icons + minimal service worker for offline last-segment cache (AUD-016); replace hardcoded mock content (billing page, sessions chart) with real data or honest empty states; implement the QR scanner and summary downloads (currently `alert()` placeholders).

---

## 4. Definition of Done (every task)

- The feature works **end-to-end against running services**, demonstrated by a test or a recorded manual run — not by a doc claim.
- No `print()` in backend; structured JSON logs with `tenant_id`/`session_id`.
- Every new endpoint has ≥1 test **including a cross-tenant negative test** where data is involved.
- Quran/Hadith content is corpus-sourced; a reviewer can trace any displayed verse to `surah:ayah` in the verified corpus.
- `PROGRESS.md` updated, ADRs logged, conventional commits on `feature/agent-N-*` branches (the single-squash-commit practice ends now).

## 5. Hard Rules (non-negotiable)

1. Never hallucinate or hand-author Quranic text; never LLM-translate a detected verse.
2. Never broadcast placeholder/simulation output to listeners.
3. No unscoped DB query; no `token == "secret"`-style auth; no wildcard CORS with credentials.
4. Voice features are consent-gated, encrypted, and erasable.
5. If you cannot verify something, mark it `UNVERIFIED` and say what would verify it — do not mark it done.

## 6. Reference Points (domain research)

- **Worship-translation operating modes** (manuscript / supervised / autopilot) + QR-join listener UX: spf.io (TheoTech) — closest analogue; its human-in-the-loop "supervised AI" is the quality benchmark for live religious translation.
- **Verified Quran text & translations:** Quran.com developer platform + Tanzil project; `risan/quran-json` (MIT) for a self-hostable corpus.
- **Voice-cloning consent:** EDPB Guidelines 02/2021 (voice = biometric data; explicit, revocable Art. 9(2)(a) consent; working erasure).
- **Live-caption quality:** streaming ASR is measurably less accurate than batch — plan the manuscript path to compensate; the NTR model is a reasonable framework for scoring live-subtitle accuracy.

*Ship nothing you haven't seen work. This product speaks in God's name to people who trust it — build accordingly.*
