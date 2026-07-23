# Phase 3B.1 – Tasks Module (Complete)

This ZIP mirrors the project's folder structure. Copy each file into the
matching path in your repo, overwriting the one modified backend file and
the one modified frontend file.

Built directly on the shipped Phase 3A foundation (Auth + Notes). It does
NOT depend on Phase 3B (Notes search/pin/favorite/sort/filters), which
was left mid-implementation in the prior conversation turn and never
delivered as a ZIP — nothing from that work is required by, or included
in, this deliverable.

## Files created

Backend:
- server/src/models/Task.model.js
- server/src/middleware/validateTasks.js
- server/src/controllers/tasks.controller.js
- server/src/routes/tasks.routes.js

Frontend:
- client/src/lib/api/tasks.api.js
- client/src/lib/utils/taskFilters.js
- client/src/lib/utils/taskSort.js
- client/src/lib/utils/taskSearch.js
- client/src/lib/utils/formatDate.js
- client/src/hooks/useTasks.js
- client/src/hooks/useVisibleTasks.js
- client/src/store/useTasksUIStore.js
- client/src/components/tasks/TaskListItem.jsx
- client/src/components/tasks/TasksToolbar.jsx
- client/src/components/tasks/TaskFormModal.jsx

## Files modified
- server/src/routes/index.js — mounted `/tasks`
- client/src/pages/Tasks.jsx — replaced the FeaturePlaceholder stub with
  the real Tasks UI

Note: `server/src/middleware/errorHandler.js` was NOT modified. Its
existing CastError → 400 handling (added in Phase 3A for Notes) checks
`err.name === 'CastError' && err.kind === 'ObjectId'` generically — it
already covers bad ObjectIds in `/api/tasks/:id` with zero changes, so
touching it here would have been unjustified duplication.

`client/src/lib/navigation.js` and `client/src/App.jsx` were also NOT
modified — both already had a `/tasks` nav entry and route pointing at
`pages/Tasks.jsx` since Phase 2A; swapping that page's contents was
enough to wire the whole feature in.

## New backend endpoints
- `GET    /api/tasks`
- `POST   /api/tasks`
- `PATCH  /api/tasks/:id`
- `DELETE /api/tasks/:id`

All behind the existing `protect` middleware, all scoped to
`req.user._id` — reused from Auth/Notes, nothing new added.

## Remaining TODOs
- `TasksSummaryCard.jsx` (dashboard) still reads from
  `dashboardMockData.js`'s mocked `fetchTasksSummary()` — could now be
  wired to real data. Left untouched, same precedent as
  `NotesSummaryCard.jsx` in Phase 3A — out of this phase's stated scope.
- No per-item pending/disabled state on the complete-toggle or delete
  buttons (a rapid double-click could fire two mutations for the same
  task). Acceptable at this scale; worth adding if that becomes a problem.
- No delete confirmation dialog for tasks — not requested in this
  phase's brief, unlike Notes' (unfinished) Phase 3B. Flagging as a
  possible follow-up for consistency between the two modules.
- No pagination on `GET /api/tasks` — same scale assumption as Notes.
- Recurring tasks, subtasks, reminders/notifications, and linking a task
  to a note are not implemented — out of this phase's scope.
- Phase 3B (Notes search/pin/favorite/sort/filters/keyboard shortcuts)
  is still incomplete from the prior turn — flagging again so it isn't
  assumed done. Happy to resume it whenever you'd like.
