import { ApiError } from './ApiError.js'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_MODEL = 'gemini-3.6-flash'
const DEFAULT_HOURS_PER_DAY = 2
const MAX_SCHEDULE_DAYS = 120
const MAX_TOKENS = 8000

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
      "focusBlocks": [
        {
          "title": "<short block name>",
          "duration": <integer, minutes>,
          "subject": "<subject name>",
          "goal": "<clear learning outcome for that block, with a concrete action and result>"
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

Create a detailed but realistic plan: give each day 2-4 focus blocks with a useful title, duration, subject, and goal. Every goal must explain an action and the intended result, not just the topic name. Spread the workload across subjects proportionally to the number of topics and difficulty, and keep each day under the available hours. Prefer a sensible cadence over listing every single day for long gaps, but do include enough detail that the student understands what to do each day. Make the plan feel practical: explain the steps, highlight what to review, practice, or memorize, and include small checkpoints. If no subjects are provided, return an empty "days" array and explain why in "summary". Never include any text outside the JSON object.`

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

Build a realistic, detailed day-by-day study schedule from today until the exam date (inclusive of today, excluding the exam date itself, which should be left free for rest/review). Distribute time across subjects roughly proportional to how many topics each has and their difficulty. Group related topics on the same day where sensible rather than scattering single topics across many days.

For every planned day, include 2-4 focus blocks with a clear title, minutes, subject, and goal. Every block goal must explain a specific action, the topic area, and the outcome. Example: "Review the oxidation-reduction reactions from class notes and complete 6 practice questions to build confidence before timed recall." Include a short subject-level goal for each subject worked that day, and a final encouraging sentence plus a one-line checkpoint reminder. Keep each day's total hours at or under the available hours per day. If the gap between today and the exam date is very large, favor a sensible study cadence over listing every single day past a reasonable planning horizon (cap around ${MAX_SCHEDULE_DAYS} days).`
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

function validateSchedule(schedule) {
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

  schedule.days.forEach((day, index) => {
    if (!day || typeof day !== 'object' || Array.isArray(day)) {
      throw new Error(`Day ${index} is invalid`)
    }
    if (typeof day.date !== 'string' || !day.date) {
      throw new Error(`Day ${index} missing date`)
    }
    if (typeof day.hours !== 'number' || Number.isNaN(day.hours) || day.hours < 0) {
      throw new Error(`Day ${index} has invalid hours`)
    }
    if (day.focusBlocks !== undefined) {
      if (!Array.isArray(day.focusBlocks)) {
        throw new Error(`Day ${index} focusBlocks must be an array when provided`)
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
      })
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
    return validateSchedule(parsed)
  } catch {
    throw new ApiError(502, "Couldn't parse or validate the generated study schedule from Gemini's response")
  }
}
