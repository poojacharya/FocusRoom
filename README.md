# FocusRoom

> A productivity and study platform designed to help you plan, focus, and study together.

FocusRoom brings personal productivity tools and collaborative study spaces into one calm, distraction-free workspace.

Instead of switching between separate apps for tasks, notes, timers, calendars, study rooms, and productivity tracking, FocusRoom brings these workflows together in a single full-stack web application.

---

## ✨ Features

### 📋 Task Management

* Create and manage tasks
* Set priorities and deadlines
* Track task completion
* Organize daily work from a centralized dashboard

### 📝 Notes

* Create and manage personal notes
* Keep study material organized in one place
* Designed as a lightweight workspace for academic notes

### 🧠 AI Study Planner

* Generate structured study plans
* Organize study goals and sessions
* Designed to make planning less overwhelming and more actionable

### ⏱️ Focus Sessions

* Dedicated focus timer
* Track completed focus sessions
* View focus history
* Monitor time spent on focused work

### 📚 Study Rooms

* Create and join virtual study rooms
* Study independently or alongside friends
* Room-based collaboration for focused sessions

### 💬 Real-Time Chat

* Communicate with other users
* Room-based messaging
* Real-time communication powered by Socket.IO

### 👥 Friends

* Find and connect with other users
* Manage friend relationships
* Build a personal study network

### 📅 Calendar

* Organize upcoming activities and study plans
* View scheduled work in a calendar-based interface

### 📊 Productivity Analytics

* Visualize productivity data
* Track focus activity
* Review productivity patterns over time

### ⚙️ Settings

* Manage account preferences
* Configure application settings
* Light/dark theme support

### 🔐 Authentication

* User registration and login
* Protected application routes
* Password recovery and reset flow
* JWT-based authentication

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* React Router
* Tailwind CSS
* Zustand
* TanStack Query
* Axios
* React Hook Form
* Zod
* Framer Motion
* Recharts
* Socket.IO Client
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.IO
* JWT
* bcrypt
* Helmet
* Express Rate Limit
* Mongo Sanitize

### Development

* Git
* GitHub
* VS Code
* npm Workspaces

---

## 🏗️ Architecture

FocusRoom follows a full-stack client-server architecture:

```text
FocusRoom
│
├── client/                     # React frontend
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── hooks/              # Custom React hooks
│       ├── layouts/            # Application layouts
│       ├── lib/                # API, utilities and configuration
│       ├── pages/              # Application pages
│       ├── store/              # Zustand state management
│       └── App.jsx             # Application routing
│
├── server/                     # Node.js + Express backend
│   ├── server.js               # Server entry point
│   └── src/
│       ├── config/             # Configuration and database setup
│       ├── controllers/        # Request handling
│       ├── middleware/         # Authentication and middleware
│       ├── models/             # MongoDB/Mongoose models
│       ├── routes/             # API routes
│       ├── sockets/             # Socket.IO functionality
│       └── utils/              # Backend utilities
│
└── package.json                # Root workspace configuration
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

* Node.js 18+
* npm
* MongoDB / MongoDB Atlas
* Git

### 1. Clone the repository

```bash
git clone https://github.com/poojacharya/FocusRoom.git
cd FocusRoom
```

### 2. Install dependencies

```bash
npm install
```

This installs dependencies for the root project, client, and server workspaces.

### 3. Configure environment variables

Create the required environment files:

```text
client/.env
server/.env
```

Use the provided `.env.example` files as templates.

> Never commit `.env` files or database credentials to GitHub.

### 4. Start the application

Run both frontend and backend together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:client
```

```bash
npm run dev:server
```

The development frontend runs on:

```text
http://localhost:5173
```

The backend runs on:

```text
http://localhost:5000
```

---

## 📁 Main Application Pages

```text
Dashboard
├── Tasks
├── Notes
├── Focus
│   └── Focus History
├── AI Planner
├── Study Rooms
│   └── Study Room Details
├── Chat
├── Friends
├── Calendar
├── Analytics
└── Settings
```

Authentication pages include:

```text
Login
Register
Forgot Password
Reset Password
```

---

## 🔒 Security

The backend includes several security-focused mechanisms:

* JWT authentication
* Password hashing with bcrypt
* Protected routes
* HTTP security headers with Helmet
* Rate limiting
* MongoDB query sanitization
* Environment-based configuration
* HTTP-only cookie support

---

## 🎯 Project Goals

FocusRoom is being developed around three core ideas:

**Plan → Focus → Connect**

### Plan

Break larger goals into manageable tasks and study plans.

### Focus

Use dedicated focus sessions and productivity tracking to build consistent work habits.

### Connect

Study with friends through collaborative study rooms and real-time communication.

---

## 🗺️ Development Roadmap

FocusRoom is being developed incrementally.

* [x] Project foundation
* [x] Core application structure
* [x] Authentication flow
* [x] Dashboard
* [x] Task management
* [x] Notes
* [x] Focus sessions
* [x] Focus history
* [x] Study rooms
* [x] Chat
* [x] Friends
* [x] Calendar
* [x] Analytics
* [x] Settings
* [ ] Expand AI planner capabilities
* [ ] Improve collaboration features
* [ ] Production deployment
* [ ] Performance and UX improvements

---

## 📌 Project Status

FocusRoom is an actively developed full-stack project.

The application is being built feature-by-feature with an emphasis on:

* Clean frontend architecture
* Secure backend APIs
* Real-time functionality
* Maintainable component structure
* Practical productivity workflows
* A calm and distraction-free user experience

---

## 👩‍💻 Author

**Pooja Charya**

Built as a full-stack development project to explore modern web development, real-time applications, authentication, productivity systems, and AI-assisted planning.
