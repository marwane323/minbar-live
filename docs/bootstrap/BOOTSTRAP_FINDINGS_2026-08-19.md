# Bootstrap Findings — 2026-08-19

**Source:** local agent run, 2026-08-19T12:37+02:00. Host: Windows 10/11 x86_64, Python 3.12.7, Node v22.11.0, npm 10.9.0, Docker 29.1.3 / Compose v2.40.3. Repo HEAD: `0bfd82e` (`main`), working tree clean.
**Method:** mission §1 bootstrap + audit-verification probes, read-only. Raw report (BOOTSTRAP_REPORT S0/S1-2/S2-3) delivered to orchestrator; this file is the consolidated record required by mission §1. The `ISSUES.md` append follows when the full report (Parts A–C, incl. ISSUES.md content) arrives, so the update is lossless.

## Verdicts

| Item | Verdict | Evidence |
|---|---|---|
| ISSUE-001 (Sprint-4 build never verified) | **CONFIRMED BROKEN** | `npm run build` exit 1; `tsc --noEmit` exit 2 with 4 errors: `admin/billing/page.tsx:30` (`indicatorColor` not a Progress prop), `imam/khutba/[id]/translate/page.tsx:41` (`boolean \| null`), `components/session/session-controls.tsx:35` (`"preparing" \| "paused"` vs `"ended"`, no overlap), `components/ui/slider.tsx:6` (`defaultValue` type). `npm audit`: 11 vulns (2 critical, 8 high). |
| AUD-004 (~20 endpoint groups missing) | Confirmed structurally | `api_gateway/app/main.py` 3,097 B only; `session_manager/app/main.py` 299 B; no routers anywhere |
| AUD-005/006 (WS contract broken both ways) | **CONFIRMED** | Frontend calls `ws/session/{id}` (`operate/page.tsx`, `hooks.ts:88`); hub exposes `/ws/listen/{id}` + `/ws/publish/{id}`. Hub envelope `event_type`/`transcription` vs frontend `type`/`transcript_update`. No `ws/operator` or `ws/listener` exists |
| AUD-007 (ML simulated) | **CONFIRMED** | ASR: both engines `_simulate_transcription` (hardcoded Arabic). TTS: both engines sine waves (440/220 Hz). Translation: all 3 providers fall back to `[Simulation - X] Translated:` when keys absent. `SIMULATION_MODE` flag does not exist (0 hits) |
| AUD-008 (corpus skeletal) | **CONFIRMED** | `quran.json` = list of 10 verses; metadata = 10 surahs; `hadith.json` = 2 entries |
| AUD-009 (glossary no-op) | **CONFIRMED** | `apply_glossary` returns input unchanged |
| AUD-010 (RLS ineffective) | **CONFIRMED — worse than reported** | App role `minbar` is **Superuser + Bypass RLS** → policies never enforced. Policies exist on 6 tables using `current_setting('app.tenant_id')::uuid`. No RLS on `khutba_segments`, `segment_translations`, `quran_verses_cache`, `hadith_cache`, `tenants` |
| AUD-011/015 (WS auth stub) | **CONFIRMED** | `/ws/publish`: `if token != "secret": close(1008)` (`websocket_hub/app/main.py:76`); no JWT verification in hub |
| AUD-012 (insecure defaults / env docs) | **CONFIRMED** | `JWT_SECRET` default `"supersecret_default_key_change_in_prod"` in `shared/config.py`; `JWT_SECRET`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `SERVICE_NAME`, `NEXT_PUBLIC_API_URL` absent from `.env.example` |
| AUD-013 (wildcard CORS) | **CONFIRMED** | api_gateway: `allow_origins=["*"]` + `allow_credentials=True` |
| AUD-014 (segment tables unscoped) | **CONFIRMED** | No `tenant_id`/RLS on `khutba_segments`, `segment_translations` (models + live `pg_tables` agree) |
| AUD-016 (PWA stubs) | Confirmed structurally | `public/` = `manifest.json` (434 B) + `.gitkeep` only |
| AUD-018 (no rate limiting) | **CONFIRMED** | No slowapi/limiter anywhere in `src/backend/` |
| AUD-020/021/022 (test harness) | **CONFIRMED** | Root env lacks `pytest-asyncio` (2 failures); e2e uses `token` param as non-fixture (4 errors); `conftest.py` is a docstring stub; `test_integration_e2e.py` crashes on Windows cp1256 (emoji in `print`) before any test runs. 15 tests pass (auth, sprint1) |
| AUD-001/002/003 (UX bugs) | Partially corroborated | tsc errors match portal defects; runtime UX still UNVERIFIED (app services never started) |

## New findings (not in the audit)

1. Makefile `seed` target points to `scripts/seed.py`; real file is `src/backend/shared/seed.py` — broken target. `migrate` target lacks `cd`/PYTHONPATH.
2. Windows host gaps: no `make`, no GNU `grep`, no `python3` alias; manual `PYTHONPATH` and `DATABASE_URL_SYNC=...@localhost:...` overrides required but undocumented (GEMINI.md only).
3. No `requirements.txt`/lockfile for Python; deps assumed preinstalled.
4. README never documents copying `.env.example` → `.env`; a `.env` from a prior run was load-bearing.
5. `docker-compose.dev.yml` carries an obsolete top-level `version` attribute (compose warning).
6. Bootstrap starts only postgres/redis/minio; the 9 app services (api-gateway :8000 … session-manager :8007, worker, frontend :3000) need image builds — no live curl of the gateway was possible.
7. `tenants` table has no RLS (likely acceptable for the pre-RLS login resolution path — must be documented as a deliberate design decision; see API_SPEC §2).
8. Two `alert()` placeholders confirmed: `join-flow.tsx:53` (QR scanner), `session-summary.tsx:15` (summary download).
9. Backend `print()`: 0 hits — clean.

## Still UNVERIFIED

- Runtime login flow against RLS (app services never started; e2e crashed pre-flight on console encoding). What verifies it: start the full compose stack and re-run the e2e with `PYTHONIOENCODING=utf-8`.
- AUD-001/002/003 runtime behavior; AUD-017 (consent fields on VoiceProfile); AUD-023.
- File contents of report Parts A/B/C (pending).