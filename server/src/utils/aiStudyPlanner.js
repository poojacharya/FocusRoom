import { ApiError } from './ApiError.js'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_MODEL = 'gemini-3.6-flash'
const DEFAULT_HOURS_PER_DAY = 2
const MAX_SCHEDULE_DAYS = 30
const MAX_TOKENS = 16000

function getApiKey() {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new ApiError(500, 'AI study planner is not configured on this server')
  }
  return key
}

const SYSTEM_PROMPT = `You are a study-schedule generator for a student productivity app called FocusRoom. You produce realistic, encouraging, detailed, and actionable day-by-day study schedules from the information you're given.

Respond with ONLY valid JSON — no markdown code fences, no commentary before or after — matching exactly this shape:
{
  "generatedAt": "<ISO 8601 timestamp>",
  "examDate": "<ISO 8601 date or null>",
  "totalDays": <integer, number of study days scheduled>,
  "summary": "<2-3 sentence overview of the overall strategy>",
  "strategy": "<1-2 sentence explanation of the study rhythm and priorities>",
  "days": [
    {
      "date": "<YYYY-MM-DD>",
      "hours": <number>,
      "focus": "<the main outcome for this day>",
      "focusBlocks": [
        {
          "title": "<short block name>",
          "duration": <integer, minutes>,
          "subject": "<subject name>",
          "location": "<where the student should study, e.g. library, desk, quiet room>",
          "method": "<how the student should study the topic, e.g. active recall, practice questions, spaced repetition>",
          "steps": ["<one specific action>", "<next specific action>", "<final check for understanding>"],
          "goal": "<measurable definition of done>",
          "resources": [
            {
              "title": "<specific resource or search topic>",
              "provider": "<Khan Academy, OpenStax, MIT OpenCourseWare, PhET, LibreTexts, or Google Scholar>",
              "searchQuery": "<focused query using the subject and topic>"
            }
          ]
        }
      ],
      "subjects": [
        {
          "name": "<subject name>",
          "goal": "<what the student should achieve for this subject today, using a concrete learning outcome>",
          "topics": ["<topic>", "..."]
        }
      ],
      "notes": "<one short, encouraging, actionable sentence that tells the student what to do next>",
      "checkpoint": "<one brief reminder to keep focus and momentum>"
    }
  ]
}

Create a highly detailed, realistic, and pedagogically sound plan. Include every calendar day from today up to (but not including) the exam date, or at most ${MAX_SCHEDULE_DAYS} days for a longer horizon. Do not skip days. Give each day 2-4 focus blocks; distribute time across subjects in proportion to topic count and difficulty, revisit topics with spaced retrieval, and reserve the final study day for a mixed timed review and confidence-building (not new material).

Make every block executable without guesswork: include 3-5 ordered, specific steps (start with what to open or recall, then exactly what to do, finish with a self-check), a measurable definition of done, one named study method, a realistic location, and a duration in minutes. Ensure the sum of block durations matches the day hours and never exceeds the student's available hours. Use retrieval practice, interleaving, worked examples, and deliberate error review where appropriate; schedule short breaks between blocks rather than counting breaks as study time. Make the daily focus a concrete outcome, not a generic subject label.

Include 1-2 genuinely relevant resource suggestions per block from this provider list only: Khan Academy, OpenStax, MIT OpenCourseWare, PhET, LibreTexts, Google Scholar. Provide a short title and a focused searchQuery, not a fabricated direct URL. Prefer the provider that best fits the topic; do not use PhET for non-interactive topics. Resource links will be generated as searches restricted to that provider. If a subject has no topics listed, create a sensible diagnostic-and-foundations sequence and state that it is based on the subject name. If no subjects are provided, return an empty "days" array and explain why in "summary". Never include any text outside the JSON object.`

function buildPrompt({ examDate, subjects, availableStudyHours }) {
  const today = new Date().toISOString().slice(0, 10)
  const hoursPerDay = availableStudyHours ?? DEFAULT_HOURS_PER_DAY

  const subjectLines = subjects.length
    ? subjects
        .map(
          (subject) =>
            `- ${subject.name}${
              subject.topics?.length ? `: ${subject.topics.join(', ')}` : ' (no topics listed)'
            }`,
        )
        .join('\n')
    : '(no subjects provided)'

  return `Today's date: ${today}
Exam date: ${examDate || 'not provided — assume 14 days from today'}
Available study hours per day: ${hoursPerDay}

Subjects and topics:
${subjectLines}

Build a realistic, highly detailed day-by-day study schedule from today until the exam date (excluding the exam date, which should be left free for rest and light review). Include every day, capped at ${MAX_SCHEDULE_DAYS} days. If the exam is more than ${MAX_SCHEDULE_DAYS} days away, make this a focused first-phase plan and say so in the summary; the student can regenerate later for the next phase. Group related topics on the same day where sensible, sequence prerequisites before advanced topics, and revisit earlier material using spaced retrieval.

For every day, add a concrete focus outcome and 2-4 focus blocks. Each block needs 3-5 ordered actions, an observable definition of done, one method, a specific location, and a realistic duration. Make daily hours equal the sum of block minutes and keep them at or under ${hoursPerDay} hours. Include 1-2 resource suggestions per block, selecting providers only from Khan Academy, OpenStax, MIT OpenCourseWare, PhET, LibreTexts, and Google Scholar; give a focused search query and never invent a direct resource URL. Include subject goals/topics for subjects worked that day, one brief next action, and a checkpoint that tests recall or catches a likely mistake. Account for gradual progression from learning to practice to mixed review; do not schedule new topics on the final study day.`
}

function extractJson(text) {
  const trimmed = String(text ?? '').trim()
  const candidates = []

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fencedMatch) candidates.push(fencedMatch[1])

  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1))
  }

  candidates.push(trimmed)

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed === 'object') return parsed
    } catch {
      // Try the next candidate if the content includes surrounding text.
    }
  }

  throw new Error('Could not find a valid JSON object in the Gemini response')
}

function extractGeminiText(payload) {
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : []

  for (const candidate of candidates) {
    const text = candidate?.content?.parts
      ?.map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('\n')
      .trim()

    if (text) return text
  }

  return null
}

function validateSchedule(schedule, { examDate, subjects, availableStudyHours }) {
  if (!schedule || typeof schedule !== 'object' || Array.isArray(schedule)) {
    throw new Error('AI response must be a JSON object')
  }

  if (typeof schedule.summary !== 'string' || !schedule.summary.trim()) {
    throw new Error('AI response missing summary')
  }

  if (schedule.strategy !== undefined && (typeof schedule.strategy !== 'string' || !schedule.strategy.trim())) {
    throw new Error('AI response strategy must be a non-empty string when provided')
  }

  if (!Array.isArray(schedule.days)) {
    throw new Error('AI response missing days array')
  }

  if (schedule.days.length > MAX_SCHEDULE_DAYS) {
    throw new Error(`AI response exceeds the ${MAX_SCHEDULE_DAYS}-day planning horizon`)
  }

  const allowedProviders = new Set([
    'Khan Academy',
    'OpenStax',
    'MIT OpenCourseWare',
    'PhET',
    'LibreTexts',
    'Google Scholar',
  ])

  if (schedule.totalDays !== schedule.days.length) {
    throw new Error('AI response totalDays does not match the days array')
  }

  const hoursPerDay = availableStudyHours ?? DEFAULT_HOURS_PER_DAY
  const today = new Date().toISOString().slice(0, 10)
  const expectedExamDate = examDate ? String(examDate).slice(0, 10) : addDays(today, 14)
  const daysUntilExam = Math.max(
    0,
    Math.floor((Date.parse(`${expectedExamDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000),
  )
  const expectedDayCount = subjects.length ? Math.min(daysUntilExam, MAX_SCHEDULE_DAYS) : 0

  if (schedule.days.length !== expectedDayCount) {
    throw new Error('AI response does not include every day in the planning horizon')
  }

  schedule.days.forEach((day, index) => {
    if (!day || typeof day !== 'object' || Array.isArray(day)) {
      throw new Error(`Day ${index} is invalid`)
    }
    if (typeof day.date !== 'string' || !day.date) {
      throw new Error(`Day ${index} missing date`)
    }
    if (day.date !== addDays(today, index)) {
      throw new Error(`Day ${index} has an incorrect or out-of-order date`)
    }
    if (typeof day.hours !== 'number' || Number.isNaN(day.hours) || day.hours < 0) {
      throw new Error(`Day ${index} has invalid hours`)
    }
    if (typeof day.focus !== 'string' || !day.focus.trim()) {
      throw new Error(`Day ${index} missing a daily focus`)
    }
    if (!Array.isArray(day.focusBlocks) || day.focusBlocks.length < 2 || day.focusBlocks.length > 4) {
      throw new Error(`Day ${index} must have 2-4 focus blocks`)
    }
    day.focusBlocks.forEach((block, blockIndex) => {
      if (!block || typeof block !== 'object' || Array.isArray(block)) {
        throw new Error(`Day ${index} focus block ${blockIndex} is invalid`)
      }
      if (typeof block.title !== 'string' || !block.title.trim()) {
        throw new Error(`Day ${index} focus block ${blockIndex} missing title`)
      }
      if (typeof block.duration !== 'number' || Number.isNaN(block.duration) || block.duration <= 0) {
        throw new Error(`Day ${index} focus block ${blockIndex} missing valid duration`)
      }
      if (typeof block.subject !== 'string' || !block.subject.trim()) {
        throw new Error(`Day ${index} focus block ${blockIndex} missing subject`)
      }
      if (typeof block.location !== 'string' || !block.location.trim()) {
        throw new Error(`Day ${index} focus block ${blockIndex} missing location`)
      }
      if (typeof block.method !== 'string' || !block.method.trim()) {
        throw new Error(`Day ${index} focus block ${blockIndex} missing study method`)
      }
      if (!Array.isArray(block.steps) || block.steps.length < 3 || block.steps.length > 5) {
        throw new Error(`Day ${index} focus block ${blockIndex} must have 3-5 steps`)
      }
      if (block.steps.some((step) => typeof step !== 'string' || !step.trim())) {
        throw new Error(`Day ${index} focus block ${blockIndex} has an invalid step`)
      }
      if (typeof block.goal !== 'string' || !block.goal.trim()) {
        throw new Error(`Day ${index} focus block ${blockIndex} missing definition of done`)
      }
      if (!Array.isArray(block.resources) || block.resources.length < 1 || block.resources.length > 2) {
        throw new Error(`Day ${index} focus block ${blockIndex} must have 1-2 resources`)
      }
      block.resources.forEach((resource, resourceIndex) => {
        if (
          !resource ||
          typeof resource.title !== 'string' ||
          !resource.title.trim() ||
          !allowedProviders.has(resource.provider) ||
          typeof resource.searchQuery !== 'string' ||
          !resource.searchQuery.trim()
        ) {
          throw new Error(`Day ${index} focus block ${blockIndex} resource ${resourceIndex} is invalid`)
        }
      })
    })

    const focusMinutes = day.focusBlocks.reduce((sum, block) => sum + block.duration, 0)
    const dayMinutes = day.hours * 60
    if (Math.abs(focusMinutes - dayMinutes) > 1) {
      throw new Error(`Day ${index} hours do not match the focus block durations`)
    }
    if (day.hours > hoursPerDay) {
      throw new Error(`Day ${index} exceeds the available study hours`)
    }
    if (!Array.isArray(day.subjects)) {
      throw new Error(`Day ${index} missing subjects array`)
    }
    day.subjects.forEach((subject, subjectIndex) => {
      if (!subject || typeof subject !== 'object' || Array.isArray(subject)) {
        throw new Error(`Day ${index} subject ${subjectIndex} is invalid`)
      }
      if (typeof subject.name !== 'string' || !subject.name.trim()) {
        throw new Error(`Day ${index} subject ${subjectIndex} missing name`)
      }
      if (subject.goal !== undefined && (typeof subject.goal !== 'string' || !subject.goal.trim())) {
        throw new Error(`Day ${index} subject ${subjectIndex} goal must be a string when provided`)
      }
      if (!Array.isArray(subject.topics)) {
        throw new Error(`Day ${index} subject ${subjectIndex} missing topics array`)
      }
    })
  })

  return schedule
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * Calls the Gemini API server-side — the API key is read from the
 * environment and never sent to or exposed by the client — to turn a
 * study plan's raw inputs (exam date, subjects/topics, available hours)
 * into a structured, day-by-day schedule. Returns a plain JS object
 * matching the shape documented in SYSTEM_PROMPT above, ready to store
 * directly in StudyPlan.generatedSchedule (Mixed).
 */
export async function generateStudySchedule({ examDate, subjects, availableStudyHours }) {
  const apiKey = getApiKey()
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt({ examDate, subjects, availableStudyHours }) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: MAX_TOKENS,
        },
      }),
    })
  } catch {
    throw new ApiError(502, "Couldn't reach the AI study planner service")
  }

  if (!response.ok) {
    let message = "Couldn't generate a study schedule right now"

    try {
      const errorData = await response.json()
      const apiMessage = errorData?.error?.message || errorData?.message
      if (apiMessage) message = `Gemini API rejected the request: ${apiMessage}`
    } catch {
      // Fall back to the generic message above if the error payload is empty.
    }

    throw new ApiError(502, message)
  }

  const data = await response.json()
  const responseText = extractGeminiText(data)
  if (!responseText) {
    throw new ApiError(502, 'AI study planner returned an unexpected response')
  }

  try {
    const parsed = extractJson(responseText)
    return validateSchedule(parsed, { examDate, subjects, availableStudyHours })
  } catch {
    throw new ApiError(502, "Couldn't parse or validate the generated study schedule from Gemini's response")
  }
}
