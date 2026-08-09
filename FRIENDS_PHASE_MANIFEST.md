# Friends System

This ZIP mirrors the project's folder structure. Copy each file into the
matching path in your repo, overwriting the two modified files.

**Note on scope:** the project state this was built against still has
`client/src/pages/Friends.jsx` as the Phase 2A `FeaturePlaceholder` stub
and no `Friend` model anywhere in the backend — so this is a full,
from-scratch implementation, not an extension of prior Friends work.

## Files created

Backend:
- `server/src/models/Friend.model.js`
- `server/src/middleware/validateFriends.js`
- `server/src/controllers/friends.controller.js`
- `server/src/routes/friends.routes.js`
- `server/src/utils/escapeRegex.js`

Frontend:
- `client/src/lib/api/friends.api.js`
- `client/src/hooks/useFriends.js`
- `client/src/components/friends/UserSearchResultItem.jsx`
- `client/src/components/friends/FriendRequestItem.jsx`
- `client/src/components/friends/FriendListItem.jsx`

## Files modified

- `server/src/routes/index.js` — mounted `/friends`
- `client/src/pages/Friends.jsx` — replaced the `FeaturePlaceholder` stub
  with the real Friends UI

**Not touched, and deliberately so:**
- `client/src/App.jsx` and `client/src/lib/navigation.js` — both already
  had a `/friends` route and sidebar/drawer nav entry since Phase 2A
  (same precedent as Tasks in Phase 3B.1); swapping the page's contents
  was enough to wire the whole feature in.
- `server/src/middleware/errorHandler.js` — its existing
  `CastError → 400` handling (added in Phase 3A, reused since) already
  covers a malformed friend/request id in any `:id` route with zero
  changes.

## New backend endpoints

All behind the existing `protect` middleware.

| Method | Path                          | Purpose                                   |
|--------|-------------------------------|--------------------------------------------|
| GET    | `/api/friends`                | List my accepted friends                   |
| GET    | `/api/friends/requests`       | List incoming (received) pending requests  |
| GET    | `/api/friends/requests/sent`  | List outgoing (sent) pending requests      |
| GET    | `/api/friends/search?q=`      | Search users by name/email, with relationship status per result |
| POST   | `/api/friends/requests`       | Send a request — body `{ recipientId }`    |
| PATCH  | `/api/friends/requests/:id/accept` | Accept a pending request (recipient only) |
| PATCH  | `/api/friends/requests/:id/reject` | Decline a pending request — deletes it (recipient only) |
| DELETE | `/api/friends/:id`            | Remove an existing friend (either party)   |

## Design notes

- **Canonical user-pair ordering, not requester/recipient fields.** Each
  `Friend` document stores `userA`/`userB` in a fixed order (the two ids
  compared as strings, smaller first) instead of directional
  requester/recipient fields, with `requestedBy` carrying direction
  separately. This lets a single unique compound index on
  `(userA, userB)` guarantee — atomically, at the database level — that
  two users can never end up with more than one relationship document
  between them, in either direction, even if both send a request to each
  other in the same instant. `sendFriendRequest` still does an explicit
  pre-check first (for a friendly, accurate error message on the normal
  path) and catches the rare race's raw duplicate-key error as a
  backstop, turning it into the same message rather than falling through
  to `errorHandler.js`'s generic "account already exists" wording, which
  doesn't fit a friend request.
- **No `'rejected'` status.** Declining a request deletes the document
  outright rather than marking it rejected, so the same two people are
  free to send a fresh request later without a stale record blocking
  them.
- **Ownership scoping via `$or` on `userA`/`userB`.** Every controller
  that reads or mutates a specific `Friend` document scopes its query to
  `{ $or: [{ userA: req.user._id }, { userB: req.user._id }] }` — the
  two-party equivalent of the single `owner: req.user._id` filter
  Notes/Tasks/FocusSessions use. Accept/reject additionally require
  `requestedBy: { $ne: req.user._id }`, so only the recipient of a
  request can ever act on it — the sender can't accept or reject their
  own outgoing request.
- **Atomic accept, mirroring the refresh-token fix.** `acceptFriendRequest`
  uses a single `findOneAndUpdate` whose filter already encodes "still
  pending" + "I'm a participant" + "I'm not the sender" — the same
  atomic-check-and-mutate shape used for refresh token rotation in
  `auth.controller.js`, so a request can't be accepted twice by two
  racing calls.
- **Search batches its relationship lookup.** `searchUsers` runs the
  user-name/email search first, then one follow-up query covering every
  candidate's relationship to the current user at once (`$in` on the
  candidate ids), rather than one relationship check per search result.
- **React Query invalidates instead of patching in place, here only.**
  See the comment above `invalidateFriendData` in `hooks/useFriends.js`:
  unlike Notes/Tasks/FocusSessions (where each mutation only ever
  touches one list), a single Friends action can affect the friends
  list, the incoming-requests list, the sent-requests list, and any open
  search results all at once. Invalidating the affected query keys keeps
  each mutation to one responsibility, at the cost of a refetch instead
  of an instant patch.
- **No dedicated Zustand UI store.** The only transient view state on
  the Friends page is the search input text, which nothing else needs to
  read — same reasoning `SearchBar.jsx`'s navbar search already uses, so
  plain `useState` + the existing `useDebouncedValue` hook was enough;
  no `useFriendsUIStore.js` was added.
- **Search input escaped before becoming a regex.** `escapeRegex.js` is
  a new small utility so characters like `.` or `(` in someone's search
  text are treated literally rather than as regex syntax.

## Remaining TODOs

- No pagination on `GET /api/friends` or the requests lists — same
  personal-scale, no-pagination assumption already made for Notes,
  Tasks, and FocusSessions.
- `useSentRequestsQuery` / `fetchSentRequests` exist on both ends but
  aren't rendered anywhere in the UI yet — there's no "requests I've
  sent, with a cancel option" section in this phase's brief. Ready for a
  future phase to use as-is (the backend endpoint and hook are both
  already wired and cache-invalidated correctly).
- No way to cancel a sent request from the UI (the backend has no
  cancel-by-sender endpoint either — only the recipient can reject).
  Straightforward follow-up: a `DELETE /api/friends/requests/:id` scoped
  to `requestedBy: req.user._id` instead of the recipient-only guard
  used by reject.
- Search is a live regex scan over `name`/`email` with no text index —
  fine at this app's scale (same reasoning as Notes/Tasks skipping
  pagination), would want a proper text index before a large user base.
- No block/mute concept — only request/accept/reject/remove.
- Real-time updates (e.g. a live badge when a new request arrives) are
  out of scope here; Socket.io integration is still on the roadmap per
  earlier phases.
