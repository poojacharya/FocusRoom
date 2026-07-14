export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center dark:border-white/10">
      {Icon && (
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-white/5">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
