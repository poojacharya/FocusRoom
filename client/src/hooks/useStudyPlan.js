import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchStudyPlan,
  createStudyPlanRequest,
  updateStudyPlanRequest,
  deleteStudyPlanRequest,
  generateStudyScheduleRequest,
} from '../lib/api/studyPlan.api'
import { showErrorToast, showSuccessToast } from '../lib/toast'

const STUDY_PLAN_KEY = ['studyPlan']

function getMutationErrorMessage(error) {
  const details = error?.response?.data?.details
  if (Array.isArray(details) && details.length) return details.join('; ')
  if (typeof details === 'string' && details) return details
  return error?.response?.data?.message || 'Something went wrong'
}

// Resolves to `null` (not an error) when no plan has been created yet —
// see the 404 handling in lib/api/studyPlan.api.js.
export function useStudyPlanQuery() {
  return useQuery({ queryKey: STUDY_PLAN_KEY, queryFn: fetchStudyPlan })
}

// Not wired into the Planner UI — the "Generate Plan" button now goes
// straight through useGenerateStudySchedule below, which upserts the
// plan and calls Claude in a single request. Left here as a plain save
// path in case a future "save without generating" control is added.
export function useCreateStudyPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createStudyPlanRequest,
    onSuccess: (plan) => {
      queryClient.setQueryData(STUDY_PLAN_KEY, plan)
      showSuccessToast('Study plan saved')
    },
    onError: (error) => showErrorToast(getMutationErrorMessage(error) || "Couldn't save your study plan"),
  })
}

export function useUpdateStudyPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateStudyPlanRequest,
    onSuccess: (plan) => {
      queryClient.setQueryData(STUDY_PLAN_KEY, plan)
      showSuccessToast('Study plan saved')
    },
    onError: (error) => showErrorToast(getMutationErrorMessage(error) || "Couldn't save your study plan"),
  })
}

// Not wired into the Planner UI yet — there's no "delete my plan"
// control in this phase's brief. Exposed now so a future phase (e.g.
// "start over") can use it without touching the API layer.
export function useDeleteStudyPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteStudyPlanRequest,
    onSuccess: () => {
      queryClient.setQueryData(STUDY_PLAN_KEY, null)
      showSuccessToast('Study plan deleted')
    },
    onError: (error) => showErrorToast(getMutationErrorMessage(error) || "Couldn't delete your study plan"),
  })
}

// Drives the Planner page's "Generate Plan" button: sends the current
// form values to POST /study-plan/generate, which saves them AND
// returns the plan with a freshly Claude-generated `generatedSchedule`.
// Patches the same STUDY_PLAN_KEY cache entry useStudyPlanQuery reads,
// so the saved-plan panel and the generated schedule update together
// from one response.
export function useGenerateStudySchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: generateStudyScheduleRequest,
    onSuccess: (plan) => {
      queryClient.setQueryData(STUDY_PLAN_KEY, plan)
      showSuccessToast('Study schedule generated')
    },
    onError: (error) =>
      showErrorToast(getMutationErrorMessage(error) || "Couldn't generate a study schedule right now"),
  })
}
