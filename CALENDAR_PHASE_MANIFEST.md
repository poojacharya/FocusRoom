# Calendar Page (Tasks-backed)

This ZIP mirrors the project's folder structure. Copy each file into the
matching path in your repo, overwriting the two modified files.

No backend changes. The calendar is a read/act view over the existing
Tasks API (`GET/PATCH/DELETE /api/tasks`) via the same `useTasksQuery`,
`useUpdateTask`, `useToggleTaskCompleted`, and `useDeleteTask` hooks the
Tasks page already uses — no new endpoint, no duplicated data-fetching
logic.

## Files created
- client/src/pages/Calendar.jsx
- client/src/components/calendar/CalendarHeader.jsx
- client/src/components/calendar/CalendarGrid.jsx
- client/src/components/calendar/CalendarDayCell.jsx
- client/src/components/calendar/CalendarDayPanel.jsx
- client/src/hooks/useTasksByDate.js
- client/src/store/useCalendarUIStore.js
- client/src/lib/utils/calendarDate.js

## Files modified
- client/src/App.jsx — registered the `/calendar` route inside the
  existing protected dashboard shell (one line added; no other route or
  guard logic touched)
- client/src/lib/navigation.js — added the "Calendar" sidebar/drawer nav
  entry (one array entry added)

Nothing else was touched — no backend files, no Notes files, no changes
to Tasks.jsx, useTasks.js, or useTasksUIStore.js. The calendar reuses
those exactly as shipped in Phase 3B.1.

## Reused as-is (not modified, just imported)
- `useTasksQuery` / `useUpdateTask` / `useToggleTaskCompleted` /
  `useDeleteTask` (hooks/useTasks.js)
- `useTasksUIStore` (for the edit-task modal's open/editing state —
  editing a task from the calendar opens the same `TaskFormModal`
  Tasks.jsx uses)
- `TaskFormModal` and `TaskListItem` (components/tasks/)
- `PageContainer`, `Card`, `SectionHeader`, `EmptyState`, `SkeletonBlock`
  (components/ui/)

## Design notes
- **Due-date timezone handling**: a task's due date is picked as a plain
  `YYYY-MM-DD` in `TaskFormModal` and stored as UTC midnight by Mongoose.
  Matching it back to a calendar cell uses UTC getters
  (`dueDateToDateKey` in `calendarDate.js`), not local getters — this
  avoids the date silently shifting by one day for people in
  negative-UTC-offset timezones. Grid cells and "today" are built
  directly in local time (`toDateKey`), which is correct for them since
  there's no serialization round-trip involved.
- **Fixed 6-week grid**: every month renders 42 cells (including
  leading/trailing days from adjacent months) so the calendar's height
  doesn't jump between 4-, 5-, and 6-row months.
- **Empty states**: three distinct cases in the day panel — no tasks
  exist at all (global empty state, shown before any day is picked),
  tasks exist but no day is selected yet (prompt), and a day is selected
  with nothing due that day (distinct "nothing due" message).

## Remaining TODOs
- No week/day view — month view only, per this phase's scope.
- No drag-to-reschedule (dragging a task to a different day to change
  its due date) — would reuse `useUpdateTask`, straightforward follow-up.
- No multi-day/date-range tasks — a task has exactly one due date.
- No calendar-specific "create task" entry point (e.g. clicking an empty
  day to create a task pre-filled with that due date) — currently you'd
  create it from the Tasks page and it will then appear here.
- Phase 3B (Notes search/pin/favorite/sort/filters/keyboard shortcuts)
  remains incomplete from earlier in this conversation — flagging again
  so it isn't assumed done.
