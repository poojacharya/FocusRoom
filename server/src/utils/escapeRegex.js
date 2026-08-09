/**
 * Escapes regex special characters in user-supplied search input before
 * it's used to build a MongoDB regex query (Friend search by name or
 * email — see controllers/friends.controller.js#searchUsers). Without
 * this, characters like '.', '*', '(' in someone's search text would be
 * interpreted as regex syntax instead of literal characters.
 */
export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
