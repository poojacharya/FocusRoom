import { motion } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react'
import { NAV_ITEMS } from '../../lib/navigation'
import { Avatar } from '../ui/Avatar'
import { Logo } from '../ui/Logo'
import { useUIStore } from '../../store/useUIStore'
import { useAuthStore } from '../../store/useAuthStore'
import { logoutUser } from '../../lib/api/auth.api'

/**
 * Rendered in two places: statically inside DashboardLayout for desktop,
 * and inside MobileSidebarDrawer for the mobile slide-over. `collapsed`
 * and `showCollapseToggle` are overridable so the mobile drawer (which
 * always shows full labels and has no collapse control of its own) isn't
 * silently affected by the desktop collapse state living in useUIStore.
 */
export function Sidebar({ onNavigate, collapsed, showCollapseToggle = true }) {
  const storeCollapsed = useUIStore((s) => s.isSidebarCollapsed)
  const toggleCollapsed = useUIStore((s) => s.toggleSidebarCollapsed)
  const isCollapsed = collapsed ?? storeCollapsed

  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch {
      // Server-side revoke failed (e.g. an already-expired refresh
      // cookie) — the session is being torn down client-side regardless,
      // so this isn't worth surfacing as an error to the person.
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex h-full flex-col border-r border-gray-100 bg-white dark:border-white/10 dark:bg-gray-950"
    >
      <div className="flex items-center justify-between gap-2 px-4 py-5">
        {!isCollapsed && <Logo />}
        {showCollapseToggle && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200 lg:inline-flex"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-3 dark:border-white/10">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={user?.name} />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.name || 'Account'}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-white/10"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
