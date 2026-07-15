import { Menu, Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUIStore } from '../../store/useUIStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useAppStore } from '../../store/useAppStore'
import { Avatar } from '../ui/Avatar'
import { SearchBar } from './SearchBar'
import { NotificationBell } from './NotificationBell'

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

  // setTheme (unlike the init path) persists to localStorage — this is a
  // deliberate choice by the person, not a system-derived default. See
  // useAppStore.js and hooks/useThemeInit.js for the full split.
  const handleThemeToggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')

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

      <SearchBar />

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleThemeToggle}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <NotificationBell />
        <Link to="/settings" aria-label="Account settings" className="ml-1">
          <Avatar name={user?.name} size="sm" />
        </Link>
      </div>
    </header>
  )
}
