# Phase 3A – Notes Module (Core CRUD)

This ZIP mirrors the project's folder structure. Copy each file into the
matching path in your repo, overwriting the two modified files.

## Files created
- server/src/models/Note.model.js
- server/src/middleware/validateNotes.js
- server/src/controllers/notes.controller.js
- server/src/routes/notes.routes.js
- client/src/lib/api/notes.api.js
- client/src/hooks/useNotes.js
- client/src/hooks/useAutosaveNote.js
- client/src/store/useNotesUIStore.js
- client/src/lib/utils/formatRelativeTime.js
- client/src/components/notes/SaveStatusIndicator.jsx
- client/src/components/notes/NoteListItem.jsx
- client/src/components/notes/NotesSidebar.jsx
- client/src/components/notes/NoteEditor.jsx

## Files modified
- server/src/routes/index.js — mounted `/notes`
- server/src/middleware/errorHandler.js — added CastError → 400 handling
  (justified: Notes is the first feature accepting a client-supplied
  ObjectId in a route param)
- client/src/pages/Notes.jsx — replaced the FeaturePlaceholder stub with
  the real two-pane Notes UI

## Remaining TODOs
- NotesSummaryCard.jsx (dashboard) still reads from dashboardMockData.js's
  mocked fetchNotesSummary() — could now be wired to real data
  (client-side aggregate off GET /api/notes, or a dedicated summary
  endpoint). Left untouched — out of this phase's stated scope.
- That same file has its own inline copy of the relative-time formatting
  now duplicated by formatRelativeTime.js — worth deduping in a later
  cleanup pass, not done here to avoid an unrequested touch to dashboard
  code.
- SearchBar.jsx / useSearch.js still return empty mock results — real
  note search is explicitly Phase 3B.
- No pagination on GET /api/notes — fine at personal-note-taking scale,
  would need revisiting before very large note counts.
- Folders, tags, pinning, markdown/rich text, AI features — explicitly
  Phase 3B per the brief, not touched.
