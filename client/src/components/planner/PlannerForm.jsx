import { Plus, Sparkles } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { SubjectTopicsRow } from './SubjectTopicsRow'

export function PlannerForm({ form, onSubmit, isSaving }) {
  const {
    examDate,
    setExamDate,
    availableStudyHours,
    setAvailableStudyHours,
    subjects,
    addSubject,
    removeSubject,
    updateSubject,
  } = form

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Exam date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        <Input
          label="Available study hours (per day)"
          type="number"
          min={0}
          step="0.5"
          placeholder="e.g. 3"
          value={availableStudyHours}
          onChange={(e) => setAvailableStudyHours(e.target.value)}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Subjects &amp; topics
          </label>
          <Button
            type="button"
            variant="secondary"
            fullWidth={false}
            className="px-3 py-1.5"
            onClick={addSubject}
          >
            <Plus className="h-4 w-4" />
            Add subject
          </Button>
        </div>

        <div className="space-y-3">
          {subjects.map((subject) => (
            <SubjectTopicsRow
              key={subject.localId}
              subject={subject}
              onChange={(changes) => updateSubject(subject.localId, changes)}
              onRemove={() => removeSubject(subject.localId)}
              canRemove={subjects.length > 1}
            />
          ))}
        </div>
      </div>

      <Button type="submit" fullWidth={false} className="px-6" isLoading={isSaving}>
        <Sparkles className="h-4 w-4" />
        Generate Plan
      </Button>
    </form>
  )
}
