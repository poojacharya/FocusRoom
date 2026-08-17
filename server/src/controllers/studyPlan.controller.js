import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { StudyPlan } from '../models/StudyPlan.model.js'
import { generateStudySchedule } from '../utils/aiStudyPlanner.js'

function normalizeSubjects(subjects) {
  if (!Array.isArray(subjects)) return []
  return subjects.map((subject) => ({
    name: subject.name.trim(),
    topics: Array.isArray(subject.topics)
      ? subject.topics.map((topic) => topic.trim()).filter(Boolean)
      : [],
  }))
}

// Single study plan per user — same ownership-scoping convention as
// Notes/Tasks/FocusSessions, just scoped by owner alone rather than
// owner + a route :id, since there is only ever one plan per person.

export const getMyStudyPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({ owner: req.user._id })
  if (!plan) throw new ApiError(404, 'Study plan not found')
  res.status(200).json(new ApiResponse(200, plan))
})

export const createStudyPlan = asyncHandler(async (req, res) => {
  const existing = await StudyPlan.findOne({ owner: req.user._id })
  if (existing) {
    throw new ApiError(409, 'A study plan already exists for this account')
  }

  const { examDate = null, subjects = [], availableStudyHours = null } = req.body

  const plan = await StudyPlan.create({
    owner: req.user._id,
    examDate,
    subjects: normalizeSubjects(subjects),
    availableStudyHours,
  })

  res.status(201).json(new ApiResponse(201, plan, 'Study plan created'))
})

// Generic partial update, same one-PATCH-endpoint convention as
// Notes/Tasks/FocusSessions. `generatedSchedule` is deliberately not
// accepted here — it's only ever written by generateStudyPlanSchedule
// below, from the AI's own response, never from raw client input.
export const updateStudyPlan = asyncHandler(async (req, res) => {
  const { examDate, subjects, availableStudyHours } = req.body
  const update = {}
  if (examDate !== undefined) update.examDate = examDate
  if (subjects !== undefined) update.subjects = normalizeSubjects(subjects)
  if (availableStudyHours !== undefined) update.availableStudyHours = availableStudyHours

  const plan = await StudyPlan.findOneAndUpdate({ owner: req.user._id }, update, {
    new: true,
    runValidators: true,
  })
  if (!plan) throw new ApiError(404, 'Study plan not found')
  res.status(200).json(new ApiResponse(200, plan, 'Study plan updated'))
})

export const deleteStudyPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOneAndDelete({ owner: req.user._id })
  if (!plan) throw new ApiError(404, 'Study plan not found')
  res.status(200).json(new ApiResponse(200, null, 'Study plan deleted'))
})

// Powers the Planner page's "Generate Plan" button: saves whatever
// exam date / subjects+topics / available hours were just submitted
// (upserting the plan — a person may not have saved one yet), calls
// Claude server-side to turn those inputs into a structured day-by-day
// schedule (see utils/aiStudyPlanner.js — the API key never reaches the
// client), and persists the result to generatedSchedule in the same
// write. The AI call happens before the database write on purpose: if
// it fails, nothing is half-saved — the person's existing plan (if any)
// is left untouched and they can just retry.
export const generateStudyPlanSchedule = asyncHandler(async (req, res) => {
  const { examDate = null, subjects = [], availableStudyHours = null } = req.body
  const normalizedSubjects = normalizeSubjects(subjects)

  const schedule = await generateStudySchedule({
    examDate,
    subjects: normalizedSubjects,
    availableStudyHours,
  })

  // Atomic upsert — mirrors the check-and-mutate pattern used for
  // refresh token rotation and friend-request accept: a single
  // findOneAndUpdate scoped to { owner: req.user._id }, with upsert
  // covering the "no plan saved yet" case, so there's no separate
  // read-then-decide-create-or-update round trip.
  const plan = await StudyPlan.findOneAndUpdate(
    { owner: req.user._id },
    {
      $set: {
        examDate,
        subjects: normalizedSubjects,
        availableStudyHours,
        generatedSchedule: schedule,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )

  res.status(200).json(new ApiResponse(200, plan, 'Study schedule generated'))
})
