import { useEffect, useState } from 'react'

let localIdCounter = 0
function nextLocalId() {
  localIdCounter += 1
  return `subject-${localIdCounter}`
}

function subjectsFromPlan(plan) {
  if (!plan?.subjects?.length) {
    return [{ localId: nextLocalId(), name: '', topics: '' }]
  }
  return plan.subjects.map((subject) => ({
    localId: nextLocalId(),
    name: subject.name ?? '',
    topics: (subject.topics ?? []).join(', '),
  }))
}

/**
 * Local, explicitly-submitted draft state for the Planner form. Unlike
 * Notes' useAutosaveNote, this does not save on every keystroke — the
 * person reviews their subjects/topics and hits "Generate Plan" to
 * persist. Seeded once from the saved plan after it loads, then left
 * alone, so a background refetch of the same data never silently
 * clobbers in-progress edits.
 */
export function useStudyPlannerForm(plan, isPlanLoading) {
  const [examDate, setExamDate] = useState('')
  const [availableStudyHours, setAvailableStudyHours] = useState('')
  const [subjects, setSubjects] = useState(() => subjectsFromPlan(null))
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    if (hasHydrated || isPlanLoading) return
    setExamDate(plan?.examDate ? plan.examDate.slice(0, 10) : '')
    setAvailableStudyHours(plan?.availableStudyHours != null ? String(plan.availableStudyHours) : '')
    setSubjects(subjectsFromPlan(plan))
    setHasHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, isPlanLoading, hasHydrated])

  const addSubject = () =>
    setSubjects((rows) => [...rows, { localId: nextLocalId(), name: '', topics: '' }])

  const removeSubject = (localId) =>
    setSubjects((rows) => (rows.length > 1 ? rows.filter((row) => row.localId !== localId) : rows))

  const updateSubject = (localId, changes) =>
    setSubjects((rows) => rows.map((row) => (row.localId === localId ? { ...row, ...changes } : row)))

  const toPayload = () => ({
    examDate: examDate || null,
    availableStudyHours: availableStudyHours === '' ? null : Number(availableStudyHours),
    subjects: subjects
      .filter((row) => row.name.trim())
      .map((row) => ({
        name: row.name.trim(),
        topics: row.topics
          .split(',')
          .map((topic) => topic.trim())
          .filter(Boolean),
      })),
  })

  return {
    examDate,
    setExamDate,
    availableStudyHours,
    setAvailableStudyHours,
    subjects,
    addSubject,
    removeSubject,
    updateSubject,
    toPayload,
  }
}
