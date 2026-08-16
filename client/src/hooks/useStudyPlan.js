import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchStudyPlan,
  createStudyPlanRequest,
  updateStudyPlanRequest,
  deleteStudyPlanRequest,
} from '../lib/api/studyPlan.api'
import { showErrorToast, showSuccessToast } from '../lib/toast'

const STUDY_PLAN_KEY = ['studyPlan']

// Resolves to `null` (not an error) when no plan has been created yet —
// see the 404 handling in lib/api/studyPlan.api.js.
export function useStudyPlanQuery() {
  return useQuery({ queryKey: STUDY_PLAN_KEY, queryFn: fetchStudyPlan })
}

export function useCreateStudyPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createStudyPlanRequest,
    onSuccess: (plan) => {
      queryClient.setQueryData(STUDY_PLAN_KEY, plan)
      showSuccessToast('Study plan saved')
    },
    onError: (error) => showErrorToast(error?.response?.data?.message || "Couldn't save your study plan"),
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
    onError: (error) => showErrorToast(error?.response?.data?.message || "Couldn't save your study plan"),
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
    onError: (error) => showErrorToast(error?.response?.data?.message || "Couldn't delete your study plan"),
  })
}
