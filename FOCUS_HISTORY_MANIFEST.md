# Focus History — Filters, Stats & Weekly Chart

Extends the Phase 4A Focus/Pomodoro feature. This ZIP mirrors the
project's folder structure — copy each file into the matching path in
your repo, overwriting the three modified files.

## Backend: no new endpoints

None were needed, so none were added. Everything on this page — the
Today/Week/Month/All filter, the three stat cards, and the weekly chart —
is derived client-side from the session list already returned by the
existing `GET /api/focus-sessions` (built in Phase 4A). That endpoint is
unpaginated and scoped to the current user, which is exactly what a
"my focus history" view needs; there's no aggregate the client can't
already compute from that same array.

This follows the same precedent as the Calendar page (see
`CALENDAR_PHASE_MANIFEST.md`), which shipped as a pure frontend view over
the existing Tasks API with zero backend changes.

If session volume ever grows large enough that shipping every session to
the client stops being reasonable, a dedicated `/api/focus-sessions/stats`
endpoint would be the natural next step — flagged here rather than built
preemptively.

## Files created

- `client/src/lib/utils/focusHistory.js` — pure functions: date-range
  filtering, stats aggregation, weekly chart data. No React, no
  fetching — fully unit-testable in isolation.
- `client/src/hooks/useFocusHistoryData.js` — wraps the existing
  `useFocusSessionsQuery` and derives the filtered list / stats / chart
  series via `useMemo`.
- `client/src/store/useFocusHistoryUIStore.js` — Zustand, UI-only: just
  the selected range (`'today' | 'week' | 'month' | 'all'`, defaults to
  `'week'`). Session data stays entirely in React Query, same split as
  every other feature's UI store.
- `client/src/components/focus/HistoryFilterTabs.jsx` — the four filter
  buttons.
- `client/src/components/focus/FocusStatsCards.jsx` — Total focus time /
  Sessions completed / Average duration.
- `client/src/components/focus/WeeklyFocusChart.jsx` — Recharts bar
  chart, minutes focused per day.
- `client/src/components/focus/HistorySessionsList.jsx` — the filtered
  session list (a separate component from the Focus page's
  `RecentSessionsList`, which is self-fetching and always shows the
  latest 8 regardless of any filter — different job, so not reused).
- `client/src/pages/FocusHistory.jsx` — assembles the above.

## Files modified

- `client/src/App.jsx` — registered `/focus/history` as a protected
  route. Deliberately **not** added to `lib/navigation.js` / the sidebar
  — it's reached via the new "History" link on the Focus page itself,
  keeping the main nav uncluttered.
- `client/src/pages/Focus.jsx` — added that "History" link next to the
  page title.
- `client/package.json` — added `recharts` (`^2.12.7`) as a dependency.
  **Run `npm install` (or `npm install --workspace=client`) after
  copying this file in** so the package and its transitive deps actually
  get installed and `package-lock.json` regenerates — the lockfile
  itself wasn't hand-edited here, since it's a generated file.

## How the ranges are defined

- **Today** — since local midnight.
- **Week** — since this Sunday at midnight (Sunday-start week, matching
  the day-of-week convention `lib/utils/calendarDate.js` already
  established for the Calendar feature).
- **Month** — since the 1st of the current calendar month.
- **All** — no filter.

All three are "so far" ranges (through right now), not fixed windows.

The **weekly chart is intentionally independent of this filter** — it
always shows the current Sunday–Saturday week, so switching the
Today/Month/All filter above it doesn't make the chart jump around. It
answers "how does my week look so far", the stat cards answer "how does
my selected range look."

## Design/UX notes
- Stat cards show `—` for total/average time when the selected range has
  zero sessions, rather than a slightly odd "0s".
- The chart's colors are resolved from `useAppStore`'s `theme` flag
  rather than Tailwind `dark:` classes, since Recharts renders raw SVG
  that Tailwind's variant system can't reach into.
- Deleting a session from the History list reuses the exact same
  `useDeleteFocusSession` mutation the Focus page's recent-sessions list
  uses — one cache, patched in place, no refetch.

## Remaining TODOs (explicitly out of scope here)
- Streaks, achievements, notifications, and AI insights on focus
  sessions are still untouched — the rest of Phase 4B.
- No CSV/export of history.
- No custom date-range picker beyond the four preset filters.
- `StudyTimerCard.jsx` on the dashboard still shows its original "coming
  soon" placeholder — flagged again in the Phase 4A manifest, still not
  addressed.
