import { api } from '../axios'

// GET /study-plan 404s when the person hasn't created a plan yet — that's
// an expected "nothing saved yet" state for this page, not a real error,
// so it's normalized to null here rather than left to reject and surface
// as a generic "couldn't load" message.
export async function fetchStudyPlan() {
  try {
    const { data } = await api.get('/study-plan')
    return data.data // StudyPlan
  } catch (error) {
    if (error?.response?.status === 404) return null
    throw error
  }
}

export async function createStudyPlanRequest(payload) {
  const { data } = await api.post('/study-plan', payload)
  return data.data // StudyPlan
}

// Single generic PATCH — mirrors updateTaskRequest/updateNoteRequest.
export async function updateStudyPlanRequest(payload) {
  const { data } = await api.patch('/study-plan', payload)
  return data.data // StudyPlan
}

export async function deleteStudyPlanRequest() {
  await api.delete('/study-plan')
}
