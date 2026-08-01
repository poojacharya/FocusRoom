# Phase 4A – Pomodoro & Focus Timer

This ZIP mirrors the project's folder structure. Copy each file into the
matching path in your repo, overwriting the three modified files.

## Files created

Backend:
- server/src/models/FocusSession.model.js
- server/src/middleware/validateFocusSessions.js
- server/src/controllers/focusSessions.controller.js
- server/src/routes/focusSessions.routes.js

Frontend:
- client/src/lib/api/focusSessions.api.js
- client/src/hooks/useFocusSessions.js
- client/src/hooks/useFocusTimerEngine.js
- client/src/store/useFocusTimerStore.js
- client/src/lib/utils/formatDuration.js
- client/src/components/focus/TimerModeTabs.jsx
- client/src/components/focus/TimerDisplay.jsx
- client/src/components/focus/TimerControls.jsx
- client/src/components/focus/DurationConfig.jsx
- client/src/components/focus/RecentSessionsList.jsx
- client/src/pages/Focus.jsx

## Files modified
- server/src/routes/index.js — mounted `/focus-sessions`
- client/src/lib/navigation.js — added a "Focus" nav entry (between Notes
  and Study Rooms) so the page is reachable from the sidebar/mobile drawer
- client/src/App.jsx — imported `Focus` and registered `/focus` as a
  protected route alongside the other dashboard-shell routes

Nothing else was touched. In particular:
- `server/src/middleware/errorHandler.js` — NOT modified. Its existing
  CastError → 400 handling (added in Phase 3A, generalized in Phase
  3B.1) already covers bad ObjectIds in `/api/focus-sessions/:id` with
  zero changes.
- `client/src/components/dashboard/StudyTimerCard.jsx` — NOT modified.
  It's still the static "Coming in a later phase" preview from Phase 2A.
  Wiring it to show a live mini-timer or link through to `/focus` would
  be a reasonable follow-up, but wasn't requested for this phase and
  touching dashboard code was out of scope — flagging it rather than
  silently doing it.

## New backend endpoints

All behind the existing `protect` middleware, all scoped to
`req.user._id` — reused from Auth/Notes/Tasks, nothing new added.

- `GET    /api/focus-sessions`     — list the current user's sessions, newest first
- `POST   /api/focus-sessions`     — create (save a finished session)
- `GET    /api/focus-sessions/:id` — fetch one
- `PATCH  /api/focus-sessions/:id` — generic partial update (not called by
  any UI yet — see Remaining TODOs)
- `DELETE /api/focus-sessions/:id` — delete

### FocusSession fields
`user`, `mode` (`pomodoro` | `stopwatch` | `countdown`), `duration`
(seconds), `startedAt`, `endedAt`, `completed`, plus `createdAt`/
`updatedAt` from `timestamps: true`.

## How the timer works

- **Zustand (`useFocusTimerStore`)** holds only in-memory timer UI state:
  `mode`, `status` (`idle`/`running`/`paused`/`completed`),
  `targetSeconds`, `elapsedSeconds`, `sessionStartedAt`. Nothing here
  touches the network or persists across a refresh — same split already
  established by `useNotesUIStore`/`useTasksUIStore`.
- **`useFocusTimerEngine`** is the one hook that both ticks the clock
  (`setInterval` while `status === 'running'`) and talks to the backend.
  It auto-saves the instant a Pomodoro or Countdown session reaches its
  target, and exposes a `finishSession()` used by the Stopwatch's
  "Finish" button (Stopwatch has no target to auto-complete against).
- **React Query (`useFocusSessions`)** owns all server state — the saved
  sessions list, with `useCreateFocusSession`/`useDeleteFocusSession`
  patching the cache in place rather than refetching.
- A session is only ever POSTed once, at the moment it completes — there
  is no "in progress" record on the server, and a Pomodoro/Countdown
  that's abandoned via **Reset** before reaching its target is simply
  never saved.

## Design/UX notes
- Pomodoro defaults to 25 minutes with 15/25/45/50-minute presets plus a
  custom-minutes input; Countdown defaults to 10 minutes with its own
  5/10/20/30 presets. Both are only editable while idle.
- Circular progress ring (SVG) for Pomodoro/Countdown; plain ticking
  digits for Stopwatch, which has no target to show progress against.
- Mode tabs disable switching away from the active mode while a session
  is running or paused, so progress can't be silently discarded by an
  accidental tab click — Reset or Finish first.
- "Recent sessions" list under the timer reads straight from
  `GET /api/focus-sessions` — this is plain data display, not analytics/
  charts/streaks, which are explicitly Phase 4B.

## Remaining TODOs
- `useUpdateFocusSession` / `PATCH /api/focus-sessions/:id` exist on both
  ends but aren't wired into any UI — there's no "edit a past session"
  flow in this phase's brief. Ready for a future phase to use as-is.
- `StudyTimerCard.jsx` on the dashboard still shows its Phase 2A static
  "coming soon" preview rather than reflecting the now-real Focus
  feature — flagged above, left untouched pending a future dashboard
  integration pass.
- No pagination on `GET /api/focus-sessions` — same personal-scale
  assumption already made for Notes and Tasks.
- If the browser tab is backgrounded/throttled, the 1-second
  `setInterval` can drift slightly rather than reconciling against wall-
  clock time. Acceptable for a personal focus timer at this scope; worth
  revisiting if precise elapsed time ever matters more (e.g. billing).
- Analytics, charts, heatmaps, streaks, achievements, notifications, and
  AI insights on focus sessions are explicitly Phase 4B — not touched.
