import { useEffect } from 'react'
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

export default function App() {
  useAuthInit()

  // The scaffold already declares `dark:` styles and darkMode: 'class' in
  // tailwind.config.js, but nothing was ever applying the class. This wires
  // up the default 'system' preference so those styles — including the new
  // auth pages — actually activate. No theme-switcher UI here; that's a
  // separate concern.
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', prefersDark)
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* Dashboard shell (Phase 2A): every route nested here renders
            inside DashboardLayout's <Outlet/> and is gated by
            ProtectedRoute, same as the old standalone "/" route was. */}
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
