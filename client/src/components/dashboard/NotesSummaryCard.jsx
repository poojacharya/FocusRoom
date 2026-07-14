import { NotebookText } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { SkeletonLine } from '../ui/Skeleton'
import { useNotesSummary } from '../../hooks/useDashboardData'

function formatRelative(isoString) {
  const minutes = Math.round((Date.now() - new Date(isoString).getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.round(minutes / 60)}h ago`
}

export function NotesSummaryCard() {
  const { data, isLoading, isError } = useNotesSummary()

  return (
    <Card>
      <SectionHeader title="Notes" subtitle="Recently edited" />
      {isLoading ? (
        <div className="space-y-2">
          <SkeletonLine className="h-6 w-1/2" />
          <SkeletonLine className="h-4 w-3/4" />
        </div>
      ) : isError ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Couldn&apos;t load notes right now.</p>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <NotebookText className="h-5 w-5 text-brand-500" />
            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {data.totalNotes}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">total notes</span>
          </div>
          <p className="mt-3 truncate text-sm text-gray-600 dark:text-gray-300">
            {data.lastEdited.title}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {formatRelative(data.lastEdited.updatedAt)}
          </p>
        </>
      )}
    </Card>
  )
}
