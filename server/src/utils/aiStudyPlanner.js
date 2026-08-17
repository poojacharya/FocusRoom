import { ApiError } from './ApiError.js'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
const DEFAULT_MODEL = 'claude-sonnet-5'
const DEFAULT_HOURS_PER_DAY = 2
const MAX_SCHEDULE_DAYS = 120
const MAX_TOKENS = 8000

function getApiKey() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    throw new ApiError(500, 'AI study planner is not configured on this server')
  }
  return key
}

const SYSTEM_PROMPT = `You are a study-schedule generator for a student productivity app called FocusHub AI. You produce realistic, encouraging, achievable day-by-day study schedules from the information you're given.

Respond with ONLY valid JSON — no markdown code fences, no commentary before or after — matching exactly this shape:
{
  "generatedAt": "<ISO 8601 timestamp>",
  "examDate": "<ISO 8601 date or null>",
  "totalDays": <integer, number of study days scheduled>,
  "days": [
    {
      "date": "<YYYY-MM-DD>",
      "hours": <number>,
      "subjects": [
        { "name": "<subject name>", "topics": ["<topic>", "..."] }
      ],
      "notes": "<one short, encouraging, actionable sentence>"
    }
  ],
  "summary": "<2-3 sentence overview of the overall strategy>"
}

If no subjects are provided, return an empty "days" array and explain why in "summary". Never include any text outside the JSON object.`

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

Build a realistic day-by-day study schedule from today until the exam date (inclusive of today, excluding the exam date itself, which should be left free for rest/review). Distribute time across subjects roughly proportional to how many topics each has. Group related topics on the same day where sensible rather than scattering single topics across many days. Keep each day's total hours at or under the available hours per day. If the gap between today and the exam date is very large, favor a sensible study cadence over listing every single day past a reasonable planning horizon (cap around ${MAX_SCHEDULE_DAYS} days).`
}

function extractJson(text) {
  const trimmed = text.trim()
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const candidate = fencedMatch ? fencedMatch[1] : trimmed
  return JSON.parse(candidate)
}

/**
 * Calls the Claude API server-side — the API key is read from the
 * environment and never sent to or exposed by the client — to turn a
 * study plan's raw inputs (exam date, subjects/topics, available hours)
 * into a structured, day-by-day schedule. Returns a plain JS object
 * matching the shape documented in SYSTEM_PROMPT above, ready to store
 * directly in StudyPlan.generatedSchedule (Mixed).
 */
export async function generateStudySchedule({ examDate, subjects, availableStudyHours }) {
  const apiKey = getApiKey()
  const model = process.env.CLAUDE_MODEL || DEFAULT_MODEL

  let response
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildPrompt({ examDate, subjects, availableStudyHours }) }],
      }),
    })
  } catch {
    throw new ApiError(502, "Couldn't reach the AI study planner service")
  }

  if (!response.ok) {
    throw new ApiError(502, "Couldn't generate a study schedule right now")
  }

  const data = await response.json()
  const textBlock = data.content?.find((block) => block.type === 'text')
  if (!textBlock?.text) {
    throw new ApiError(502, 'AI study planner returned an unexpected response')
  }

  try {
    return extractJson(textBlock.text)
  } catch {
    throw new ApiError(502, "Couldn't parse the generated study schedule")
  }
}
