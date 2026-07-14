import { SpinnerIcon } from './icons'

const VARIANTS = {
  primary:
    'bg-brand-500 text-white shadow-sm hover:bg-brand-600 focus:ring-brand-500 dark:focus:ring-offset-gray-950',
  secondary:
    'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300 dark:bg-white/10 dark:text-gray-100 dark:hover:bg-white/15',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5',
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  disabled,
  className = '',
  type = 'button',
  // Added for Phase 2A: dashboard widgets need compact, inline buttons
  // (e.g. an icon-only play control on the Study Timer card) alongside
  // the existing full-width auth-form buttons. Defaults to true, so every
  // existing call site (all of which omit this prop) renders identically
  // to before this change.
  fullWidth = true,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex ${fullWidth ? 'w-full' : ''} items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {isLoading && <SpinnerIcon className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
