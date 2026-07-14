import { Bell, Menu, Moon, Search, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUIStore } from '../../store/useUIStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useAppStore } from '../../store/useAppStore'
import { Avatar } from '../ui/Avatar'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function Navbar() {
  const openMobileSidebar = useUIStore((s) => s.openMobileSidebar)
  const user = useAuthStore((s) => s.user)
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const firstName = (user?.name || '').split(' ')[0]

  // Placeholder toggle (goal: "Theme toggle placeholder"): flips the
  // `dark` class immediately so the control is genuinely usable, but
  // doesn't persist the choice or reconcile with the OS-preference
  // listener in App.jsx, and doesn't know about the 'system' state the
  // store starts in — that's real Settings-page scope for a later phase.
  const handleThemeToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', next === 'dark')
    setTheme(next)
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-gray-950/80 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openMobileSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="hidden text-sm text-gray-500 dark:text-gray-400 sm:block">
          {getGreeting()}
          {firstName ? `, ${firstName}` : ''}
        </p>
      </div>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks, notes, and more..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-brand-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:focus:bg-white/10"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleThemeToggle}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
        </button>
        <Link to="/settings" aria-label="Account settings" className="ml-1">
          <Avatar name={user?.name} size="sm" />
        </Link>
      </div>
    </header>
  )
}
