import { CheckSquare, Plus } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonLine } from '../components/ui/Skeleton'
import { TasksToolbar } from '../components/tasks/TasksToolbar'
import { TaskListItem } from '../components/tasks/TaskListItem'
import { TaskFormModal } from '../components/tasks/TaskFormModal'
import {
  useTasksQuery,
  useCreateTask,
  useUpdateTask,
  useToggleTaskCompleted,
  useDeleteTask,
} from '../hooks/useTasks'
import { useVisibleTasks } from '../hooks/useVisibleTasks'
import { useTasksUIStore } from '../store/useTasksUIStore'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

export default function Tasks() {
  const { data: tasks = [], isLoading, isError } = useTasksQuery()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const toggleCompleted = useToggleTaskCompleted()
  const deleteTask = useDeleteTask()

  const searchQuery = useTasksUIStore((s) => s.searchQuery)
  const activeFilter = useTasksUIStore((s) => s.activeFilter)
  const sortMode = useTasksUIStore((s) => s.sortMode)
  const isFormOpen = useTasksUIStore((s) => s.isFormOpen)
  const editingTaskId = useTasksUIStore((s) => s.editingTaskId)
  const setSearchQuery = useTasksUIStore((s) => s.setSearchQuery)
  const setActiveFilter = useTasksUIStore((s) => s.setActiveFilter)
  const setSortMode = useTasksUIStore((s) => s.setSortMode)
  const openCreateForm = useTasksUIStore((s) => s.openCreateForm)
  const openEditForm = useTasksUIStore((s) => s.openEditForm)
  const closeForm = useTasksUIStore((s) => s.closeForm)

  // Same immediate-input / debounced-filter split used by the dashboard
  // SearchBar and Notes' search — typing feels instant, the derived list
  // recompute is what's debounced.
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)
  const visibleTasks = useVisibleTasks(tasks, {
    searchQuery: debouncedSearchQuery,
    filterMode: activeFilter,
    sortMode,
  })

  const editingTask = tasks.find((t) => t._id === editingTaskId) ?? null
  const isFilteredEmpty = !isLoading && !isError && tasks.length > 0 && visibleTasks.length === 0

  const handleToggleCompleted = (task) => {
    toggleCompleted.mutate({ id: task._id, completed: !task.completed })
  }

  const handleSubmitForm = (values) => {
    if (editingTaskId) {
      updateTask.mutate({ id: editingTaskId, ...values }, { onSuccess: closeForm })
    } else {
      createTask.mutate(values, { onSuccess: closeForm })
    }
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Tasks"
        subtitle="Everything on your plate, in one place"
        action={
          <Button type="button" fullWidth={false} onClick={openCreateForm}>
            <Plus className="h-4 w-4" />
            New task
          </Button>
        }
      />

      <Card padding="none">
        <TasksToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortMode={sortMode}
          onSortChange={setSortMode}
        />

        <div className="p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              <SkeletonLine className="h-12 w-full" />
              <SkeletonLine className="h-12 w-full" />
              <SkeletonLine className="h-12 w-full" />
            </div>
          ) : isError ? (
            <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
              Couldn&apos;t load your tasks right now.
            </p>
          ) : isFilteredEmpty ? (
            <EmptyState
              icon={CheckSquare}
              title="No matching tasks"
              description="Try a different search term or filter."
            />
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks yet"
              description="Add your first task to start tracking your work."
              action={
                <Button type="button" fullWidth={false} onClick={openCreateForm}>
                  New task
                </Button>
              }
            />
          ) : (
            <ul className="space-y-1">
              {visibleTasks.map((task) => (
                <TaskListItem
                  key={task._id}
                  task={task}
                  onToggleCompleted={handleToggleCompleted}
                  onEdit={openEditForm}
                  onDelete={(id) => deleteTask.mutate(id)}
                />
              ))}
            </ul>
          )}
        </div>
      </Card>

      <TaskFormModal
        isOpen={isFormOpen}
        task={editingTask}
        onSubmit={handleSubmitForm}
        onClose={closeForm}
        isSubmitting={createTask.isPending || updateTask.isPending}
      />
    </PageContainer>
  )
}
