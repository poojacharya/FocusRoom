// Two primitives instead of one configurable component: lines (text-height,
// rounded-md) and blocks (larger areas, rounded-xl) cover every skeleton
// shape used across the dashboard widgets without a prop-driven variant API.
export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 dark:bg-white/10 ${className}`} />
}

export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-white/10 ${className}`} />
}
