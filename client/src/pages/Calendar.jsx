import { useMemo } from 'react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { SkeletonBlock } from '../components/ui/Skeleton'
import { CalendarHeader } from '../components/calendar/CalendarHeader'
import { CalendarGrid } from '../components/calendar/CalendarGrid'
import { CalendarDayPanel } from '../components/calendar/CalendarDayPanel'
import { TaskFormModal } from '../components/tasks/TaskFormModal'
import { useTasksQuery, useUpdateTask, useToggleTaskCompleted, useDeleteTask } from '../hooks/useTasks'
import { useTasksByDate } from '../hooks/useTasksByDate'
import { useCalendarUIStore } from '../store/useCalendarUIStore'
import { useTasksUIStore } from '../store/useTasksUIStore'
import { getMonthGrid, toDateKey } from '../lib/utils/calendarDate'

export default function CalendarPage() {
  // Same query the Tasks page uses — the calendar is just a different
  // view over the same data, not a second fetch or a new endpoint.
  const { data: tasks = [], isLoading, isError } = useTasksQuery()
  const updateTask = useUpdateTask()
  const toggleCompleted = useToggleTaskCompleted()
  const deleteTask = useDeleteTask()

  const visibleYear = useCalendarUIStore((s) => s.visibleYear)
  const visibleMonth = useCalendarUIStore((s) => s.visibleMonth)
  const selectedDateKey = useCalendarUIStore((s) => s.selectedDateKey)
  const goToPreviousMonth = useCalendarUIStore((s) => s.goToPreviousMonth)
  const goToNextMonth = useCalendarUIStore((s) => s.goToNextMonth)
  const goToToday = useCalendarUIStore((s) => s.goToToday)
  const selectDate = useCalendarUIStore((s) => s.selectDate)

  // Reuses the Tasks page's own edit-modal state and TaskFormModal
  // component — editing a task from the calendar opens the exact same
  // form Tasks.jsx uses, instead of a second parallel edit UI.
  const isFormOpen = useTasksUIStore((s) => s.isFormOpen)
  const editingTaskId = useTasksUIStore((s) => s.editingTaskId)
  const openEditForm = useTasksUIStore((s) => s.openEditForm)
  const closeForm = useTasksUIStore((s) => s.closeForm)

  const tasksByDate = useTasksByDate(tasks)
  const todayDateKey = useMemo(() => toDateKey(new Date()), [])
  const weeks = useMemo(
    () => getMonthGrid(visibleYear, visibleMonth, todayDateKey),
    [visibleYear, visibleMonth, todayDateKey],
  )

  const tasksForSelectedDay = selectedDateKey ? tasksByDate.get(selectedDateKey) ?? [] : []
  const editingTask = tasks.find((t) => t._id === editingTaskId) ?? null

  const handleToggleCompleted = (task) => {
    toggleCompleted.mutate({ id: task._id, completed: !task.completed })
  }

  const handleSubmitEditForm = (values) => {
    if (!editingTaskId) return
    updateTask.mutate({ id: editingTaskId, ...values }, { onSuccess: closeForm })
  }

  return (
    <PageContainer>
      <SectionHeader title="Calendar" subtitle="See what's due, day by day" />

      {isError ? (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Couldn&apos;t load your tasks right now.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card padding="none" className="lg:col-span-2">
            {isLoading ? (
              <div className="space-y-3 p-4">
                <SkeletonBlock className="h-8 w-40" />
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 42 }).map((_, index) => (
                    // Static placeholder grid — index-as-key is fine here,
                    // these skeleton cells never reorder or change.
                    // eslint-disable-next-line react/no-array-index-key
                    <SkeletonBlock key={index} className="h-16 w-full sm:h-20" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <CalendarHeader
                  year={visibleYear}
                  month={visibleMonth}
                  onPrevious={goToPreviousMonth}
                  onNext={goToNextMonth}
                  onToday={goToToday}
                />
                <CalendarGrid
                  weeks={weeks}
                  tasksByDate={tasksByDate}
                  selectedDateKey={selectedDateKey}
                  onSelectDate={selectDate}
                />
              </>
            )}
          </Card>

          <Card padding="none">
            {isLoading ? (
              <div className="space-y-2 p-4">
                <SkeletonBlock className="h-6 w-2/3" />
                <SkeletonBlock className="h-12 w-full" />
                <SkeletonBlock className="h-12 w-full" />
              </div>
            ) : (
              <CalendarDayPanel
                selectedDateKey={selectedDateKey}
                tasksForDay={tasksForSelectedDay}
                hasAnyTasks={tasks.length > 0}
                onToggleCompleted={handleToggleCompleted}
                onEdit={openEditForm}
                onDelete={(id) => deleteTask.mutate(id)}
              />
            )}
          </Card>
        </div>
      )}

      <TaskFormModal
        isOpen={isFormOpen}
        task={editingTask}
        onSubmit={handleSubmitEditForm}
        onClose={closeForm}
        isSubmitting={updateTask.isPending}
      />
    </PageContainer>
  )
}
