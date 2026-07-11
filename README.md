# FocusHub AI

An AI-powered productivity platform for students — Notion-style notes, Discord-style
study rooms, Google Calendar-style scheduling, and a Claude-powered AI study planner,
built as a single production-quality MERN monorepo.

This repo is being built **incrementally, one feature per commit**. This commit
contains only the project scaffolding: folder structure, tooling, and a base
server/client that talk to each other. No feature logic yet.

## Stack

- **Client:** React, Vite, TailwindCSS, React Router, Zustand, TanStack Query, Socket.io Client, Framer Motion
- **Server:** Node.js, Express, MongoDB/Mongoose, Socket.io, JWT (added in the Auth feature)
- **AI:** Claude API (added in the AI Notes / AI Planner features)

## Folder structure

```
focushub-ai/
├── client/                 # Vite + React app
│   ├── src/
│   │   ├── pages/          # Route-level page components
│   │   ├── components/     # Reusable UI components
│   │   ├── store/          # Zustand stores
│   │   ├── lib/            # axios instance, query client, socket client, etc.
│   │   └── hooks/          # Custom React hooks
│   └── ...
├── server/                 # Express API
│   ├── server.js           # Entry point
│   └── src/
│       ├── app.js          # Express app: middleware + route mounting
│       ├── config/         # DB connection, env-driven config
│       ├── routes/         # Route definitions, mounted under /api
│       ├── controllers/    # Request handlers (added per feature)
│       ├── models/         # Mongoose schemas (added per feature)
│       ├── middleware/     # Error handling, auth guards, etc.
│       ├── utils/          # ApiError, ApiResponse, asyncHandler
│       └── sockets/        # Socket.io connection + event handlers
└── package.json             # npm workspaces root
```

## Getting started

Requires Node.js 18+ and a MongoDB instance (local or Atlas).

```bash
# 1. Install everything (root + both workspaces)
npm install

# 2. Set up environment variables
cp client/.env.example client/.env
cp server/.env.example server/.env
# then edit server/.env with your MongoDB URI

# 3. Run client + server together
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000
- Health check: http://localhost:5000/api/health

Vite is configured to proxy `/api` and `/socket.io` requests to the server, so the
client never needs to hardcode the API origin during development.

## Feature roadmap

Each box below is one feature, implemented and committed on its own.

- [x] 0. Project scaffolding
- [ ] 1. Authentication (JWT + refresh tokens, email verification, password reset)
- [ ] 2. User profiles
- [ ] 3. Friends system
- [ ] 4. Study rooms
- [ ] 5. Real-time chat
- [ ] 6. Notes editor
- [ ] 7. AI note features (summarize, flashcards, quizzes)
- [ ] 8. Task management
- [ ] 9. AI planner
- [ ] 10. Calendar
- [ ] 11. Pomodoro timer
- [ ] 12. Productivity dashboard
- [ ] 13. Resource library
- [ ] 14. Global search
- [ ] 15. Settings
- [ ] 16. Admin panel

## Conventions

- One feature per commit; commit messages describe the feature, not the files.
- API responses use a consistent envelope via `ApiResponse` (success) and
  `ApiError` (thrown, caught by the global error handler).
- Route handlers are wrapped in `asyncHandler` so rejected promises reach the
  error middleware instead of crashing the process.
- Client and server both read config from `.env` files that are gitignored;
  only `.env.example` files are committed.
