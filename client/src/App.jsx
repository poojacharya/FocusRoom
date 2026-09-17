import { Analytics } from "@vercel/analytics/next"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Notes from './pages/Notes'
import Focus from './pages/Focus'
import FocusHistory from './pages/FocusHistory'
import Planner from './pages/Planner'
import StudyRoom from './pages/StudyRoom'
import StudyRoomDetail from './pages/StudyRoomDetail'
import Chat from './pages/Chat'
import Friends from './pages/Friends'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/RouteGuards'
import { Toaster } from './lib/toast'
import { useAuthInit } from './hooks/useAuthInit'
import { useThemeInit } from './hooks/useThemeInit'

export default function App() {
  useAuthInit()
  // Resolves the saved theme, or falls back to the OS-level preference on
  // a first visit, and applies it — see hooks/useThemeInit.js and
  // lib/theme.js. Replaces the Phase 2A inline matchMedia-only effect,
  // which ignored any saved preference entirely.
  useThemeInit()

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* Dashboard shell: every route nested here renders inside
            DashboardLayout's <Outlet/> and is gated by ProtectedRoute. */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/focus" element={<Focus />} />
          {/* Not in the sidebar nav — reached via the "History" link on
              the Focus page itself, same as how a note or task's detail
              view doesn't need its own top-level nav entry. */}
          <Route path="/focus/history" element={<FocusHistory />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/study-room" element={<StudyRoom />} />
          {/* Same precedent as /focus/history — a single room's detail
              view is reached by clicking a room card, not from the
              sidebar, so it doesn't get its own nav entry either. */}
          <Route path="/study-room/:id" element={<StudyRoomDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicOnlyRoute>
              <ResetPasswordPage />
            </PublicOnlyRoute>
          }
        />

        {/* Any unmatched/stale URL (typo, old bookmark, removed route)
            previously rendered a blank page since nothing in this tree
            matched it. Redirecting to "/" routes it back through
            ProtectedRoute, which itself falls back to "/login" for a
            signed-out visitor — so this never bypasses auth. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
