# 🕌 Minbar Live — Sprint 4 Resume Prompt

Copy and paste this into your next AI Agent session to resume **Sprint 4 build verification and polish**.

---

```markdown
You are resuming work on **Minbar Live (منبر لايف)** — Sprint 4 (Frontend Portals).

## What Was Completed (2026-08-18)

Sprint 4 code is **100% written** but the build has NOT been verified yet.

### Foundation (COMPLETE)
- Design system: tailwind.config.ts with HSL CSS variables, globals.css with Quran/Hadith utilities
- Shared infra: lib/types.ts (all TypeScript interfaces), lib/api.ts (authenticated fetch), lib/ws.ts (WebSocket with auto-reconnect), lib/hooks.ts (useApi, useWebSocket, useMutation, usePolling)
- 23 shadcn-style UI components in components/ui/ (button, input, card, badge, tabs, dialog, select, etc.)
- Layout components: sidebar.tsx, page-shell.tsx
- Arabic components: rtl-text.tsx, quran-verse.tsx
- Providers: SessionProvider wrapper, next-auth.d.ts type extensions
- 548 npm packages installed (Radix UI, tiptap, recharts, qrcode.react, zustand, swr, etc.)

### AGENT-10: Imam Portal (11 files)
- 7 pages: layout, dashboard, khutba/new, khutba/[id]/edit, khutba/[id]/translate, voice-setup, sessions
- 4 components: khutba-editor, verse-highlighter, translation-review, voice-profile-setup

### AGENT-11: Operator Portal (9 files)
- 3 pages: layout, session list, session/[id]/operate
- 6 components: live-transcript, audio-device-selector, multi-language-panel, qr-code-display, session-controls, latency-monitor

### AGENT-12: Listener PWA (9 files)
- 4 pages: layout, join page, [session_id] page, listen-client
- 4 components: join-flow, live-text-view, live-audio-player, session-summary
- PWA manifest.json

### AGENT-13: Admin Portal (14 files)
- 7 pages: layout, dashboard, users, sessions, settings, billing, branding
- 7 components: stats-cards, user-table, session-archive, glossary-editor, branding-editor, recent-activity, sessions-chart

## Known Issue
First build failed: missing `@/components/ui/slider` — **FIXED** by creating slider.tsx. Rebuild not yet run.

## Your First Actions

1. Run `npm run build` in `src/frontend/` to verify the build.
2. Fix any remaining TypeScript/import errors.
3. Run `npm run dev` and visually test each portal.
4. Run `graphify update .` after any code changes.
5. Update PROGRESS.md when build passes.

## After Build Passes — Remaining Sprint 4 Work
- Visual QA on all 4 portals
- Ensure RTL rendering works correctly for Arabic content
- Test WebSocket integration on operator and listener portals
- Verify responsive design on mobile viewports
- Add service worker for Listener PWA offline support
- Update PROGRESS.md to mark Sprint 4 ✅ COMPLETE

## Environment
- Frontend: `cd src/frontend && npm run dev` (port 3000)
- Backend API: http://localhost:8000
- WebSocket: ws://localhost:8006
- Seed login: admin@al-noor.test / minbar_dev_123
- Imam login: imam@al-noor.test / minbar_dev_123
```
