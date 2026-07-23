import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

const PRIORITY_OPTIONS = ['low', 'medium', 'high']

const emptyDraft = { title: '', description: '', priority: 'medium', dueDate: '', tags: '' }

function toDraft(task) {
  if (!task) return emptyDraft
  return {
    title: task.title ?? '',
    description: task.description ?? '',
    priority: task.priority ?? 'medium',
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    tags: (task.tags ?? []).join(', '),
  }
}

/**
 * One modal handles both create and edit — `task` is null for "new task"
 * and the task object for "editing". Used by both the "New task" button
 * and clicking a TaskListItem, so there's a single form implementation
 * instead of a separate create form and edit form.
 */
export function TaskFormModal({ isOpen, task, onSubmit, onClose, isSubmitting }) {
  const [draft, setDraft] = useState(emptyDraft)
  const [titleError, setTitleError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setDraft(toDraft(task))
      setTitleError('')
    }
  }, [isOpen, task])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!draft.title.trim()) {
      setTitleError('Title is required')
      return
    }
    onSubmit({
      title: draft.title.trim(),
      description: draft.description.trim(),
      priority: draft.priority,
      dueDate: draft.dueDate || null,
      tags: draft.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-form-title"
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-gray-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="task-form-title" className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {task ? 'Edit task' : 'New task'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                label="Title"
                placeholder="What needs doing?"
                value={draft.title}
                error={titleError}
                onChange={(e) => {
                  setDraft((d) => ({ ...d, title: e.target.value }))
                  if (titleError) setTitleError('')
                }}
              />

              <div className="w-full">
                <label
                  htmlFor="task-description"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="task-description"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  placeholder="Optional details"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white/60 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all duration-150 placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/50 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="w-full">
                  <label
                    htmlFor="task-priority"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    value={draft.priority}
                    onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 bg-white/60 px-3 py-2.5 text-sm capitalize text-gray-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/50 dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
                  >
                    {PRIORITY_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Due date"
                  type="date"
                  value={draft.dueDate}
                  onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
                />
              </div>

              <Input
                label="Tags"
                placeholder="comma, separated, tags"
                value={draft.tags}
                onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" fullWidth={false} onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" fullWidth={false} isLoading={isSubmitting}>
                  {task ? 'Save changes' : 'Create task'}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
