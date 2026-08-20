import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Timer } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { SkeletonBlock } from '../ui/Skeleton'
import { EmptyState } from '../ui/EmptyState'
import { useAppStore } from '../../store/useAppStore'
import { getWeekdayLabel } from '../../lib/utils/formatAnalyticsDate'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs shadow-lg dark:border-white/10 dark:bg-gray-900">
      <p className="font-medium text-gray-700 dark:text-gray-200">{label}</p>
      <p className="text-gray-500 dark:text-gray-400">{payload[0].value} min focused</p>
    </div>
  )
}

// Same theme-resolution approach as Focus History's WeeklyFocusChart —
// Recharts renders raw SVG, which can't pick up Tailwind's `dark:`
// variant, so colors are read from useAppStore's theme flag instead.
export function WeeklyFocusActivityChart({ data, isLoading }) {
  const theme = useAppStore((s) => s.theme)
  const isDark = theme === 'dark'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'
  const tickColor = isDark ? '#6b7280' : '#9ca3af'
  const cursorFill = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'

  const chartData = (data ?? []).map((day) => ({ label: getWeekdayLabel(day.date), minutes: day.minutes }))
  const hasActivity = chartData.some((day) => day.minutes > 0)

  return (
    <Card>
      <SectionHeader title="Weekly focus activity" subtitle="Minutes focused per day" />
      {isLoading ? (
        <SkeletonBlock className="h-56 w-full" />
      ) : !hasActivity ? (
        <div className="flex h-56 items-center justify-center">
          <EmptyState
            icon={Timer}
            title="No focus sessions yet"
            description="Finish a focus session to see your weekly activity here."
          />
        </div>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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
