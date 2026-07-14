export function Card({ children, className = '', padding = 'default', ...props }) {
  const paddings = { none: '', sm: 'p-4', default: 'p-6', lg: 'p-8' }
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-100/50 dark:border-white/10 dark:bg-white/5 dark:shadow-none ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
