import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Notes from './pages/Notes'
import StudyRoom from './pages/StudyRoom'
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
          <Route path="/study-room" element={<StudyRoom />} />
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
      </Routes>
    </BrowserRouter>
  )
}
