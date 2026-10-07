import { Link } from 'react-router-dom'

export function Logo({ className = '', showName = true }) {
  return (
    <Link
      to="/"
      aria-label="FocusRoom dashboard"
      className={`flex items-center gap-2 ${className}`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 font-semibold text-white shadow-sm">
        F
      </div>
      {showName && (
        <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Focus<span className="text-brand-500">Room</span>
        </span>
      )}
    </Link>
  )
}
