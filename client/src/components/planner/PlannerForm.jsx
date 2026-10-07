import { AlertCircle, Plus, Sparkles } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { SubjectTopicsRow } from './SubjectTopicsRow'

export function PlannerForm({ form, onSubmit, isSaving, compact = false }) {
  const {
    examDate,
    setExamDate,
    availableStudyHours,
    setAvailableStudyHours,
    subjects,
    addSubject,
    removeSubject,
    updateSubject,
    validation,
  } = form

  return (
    <form onSubmit={onSubmit} noValidate className={compact ? 'space-y-3' : 'space-y-5'}>
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? 'gap-3' : 'gap-4'}`}>
        <Input label="Exam date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        <Input
          label="Available study hours (per day)"
          type="number"
          min={0}
          max={24}
          step="0.5"
          placeholder="e.g. 3"
          value={availableStudyHours}
          onChange={(e) => {
            const value = e.target.value
            const numeric = Number(value)
            setAvailableStudyHours(Number.isFinite(numeric) ? Math.min(numeric, 24).toString() : value)
          }}
        />
      </div>

      {validation?.summary && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{validation.summary}</span>
          </div>
        </div>
      )}

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

        <div className={compact ? 'space-y-2' : 'space-y-3'}>
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

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-gray-300">
        <span>{subjects.filter((row) => row.name.trim()).length} subjects selected</span>
        <span>{Number(availableStudyHours || 0)} hours/day</span>
      </div>

      <Button
        type="submit"
        fullWidth={false}
        className="px-6"
        isLoading={isSaving}
        disabled={!validation?.canSubmit}
      >
        <Sparkles className="h-4 w-4" />
        Generate Plan
      </Button>
    </form>
  )
}
