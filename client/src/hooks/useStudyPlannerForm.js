import { useEffect, useMemo, useState } from 'react'

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
  }, [plan, isPlanLoading, hasHydrated])

  const addSubject = () =>
    setSubjects((rows) => [...rows, { localId: nextLocalId(), name: '', topics: '' }])

  const removeSubject = (localId) =>
    setSubjects((rows) => (rows.length > 1 ? rows.filter((row) => row.localId !== localId) : rows))

  const updateSubject = (localId, changes) =>
    setSubjects((rows) => rows.map((row) => (row.localId === localId ? { ...row, ...changes } : row)))

  const validation = useMemo(() => {
    const validSubjectCount = subjects.filter((row) => row.name.trim()).length
    const numericHours = Number(availableStudyHours)
    const isDateValid = !examDate || !Number.isNaN(new Date(examDate).getTime())
    const isHoursValid = availableStudyHours === '' || (Number.isFinite(numericHours) && numericHours >= 0)
    const canSubmit = isDateValid && isHoursValid && validSubjectCount > 0 && examDate

    if (!examDate && !availableStudyHours && validSubjectCount === 0) {
      return { canSubmit: false, summary: 'Add your exam date, daily hours, and at least one subject to generate a plan.' }
    }

    if (!examDate) {
      return { canSubmit: false, summary: 'Choose an exam date so the plan can map out revision time correctly.' }
    }

    if (!isHoursValid || numericHours < 0.5) {
      return { canSubmit: false, summary: 'Set a realistic daily study time of at least 0.5 hours.' }
    }

    if (validSubjectCount === 0) {
      return { canSubmit: false, summary: 'Add at least one subject before generating a study plan.' }
    }

    return { canSubmit, summary: `This plan will cover ${validSubjectCount} subject${validSubjectCount === 1 ? '' : 's'} across ${numericHours || 0} hours per day.` }
  }, [availableStudyHours, examDate, subjects])

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
    validation,
    toPayload,
  }
}
