import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { SkeletonBlock } from '../ui/Skeleton'
import { useAppStore } from '../../store/useAppStore'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs shadow-lg dark:border-white/10 dark:bg-gray-900">
      <p className="font-medium text-gray-700 dark:text-gray-200">{label}</p>
      <p className="text-gray-500 dark:text-gray-400">{payload[0].value} min focused</p>
    </div>
  )
}

// Recharts renders raw SVG, which can't pick up Tailwind's `dark:`
// variant the way the rest of the UI does — colors here are resolved
// from the same theme flag Navbar's toggle writes to (see
// store/useAppStore.js) instead of CSS classes.
export function WeeklyFocusChart({ data, isLoading }) {
  const theme = useAppStore((s) => s.theme)
  const isDark = theme === 'dark'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'
  const tickColor = isDark ? '#6b7280' : '#9ca3af'
  const cursorFill = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'

  return (
    <Card>
      <SectionHeader title="This week" subtitle="Minutes focused per day" />
      {isLoading ? (
        <SkeletonBlock className="h-56 w-full" />
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: tickColor, fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: tickColor, fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: cursorFill }} />
              <Bar dataKey="minutes" fill="#5b5ff5" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
