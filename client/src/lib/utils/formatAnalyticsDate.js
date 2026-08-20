const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// The analytics endpoint returns plain 'YYYY-MM-DD' date keys. Parsing
// that string directly with `new Date(...)` treats it as UTC midnight,
// which can shift the weekday by one in negative-UTC-offset timezones —
// same issue documented for due dates in lib/utils/calendarDate.js.
// Splitting and constructing the Date from explicit local components
// avoids that shift.
export function getWeekdayLabel(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return WEEKDAY_SHORT[new Date(year, month - 1, day).getDay()]
}
