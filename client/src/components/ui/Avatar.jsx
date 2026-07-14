const PALETTE = ['bg-brand-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500', 'bg-violet-500']

function colorForName(name = '') {
  if (!name) return PALETTE[0]
  return PALETTE[name.charCodeAt(0) % PALETTE.length]
}

function initialsForName(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// GAP (flagged, not silently worked around): the backend User model has no
// avatar/profile-image field yet (see Phase 1A gaps in the auth feature),
// so this always renders initials. Swap in a real <img src={user.avatarUrl}>
// once a profile-picture field/endpoint exists.
export function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorForName(name)} ${sizes[size]}`}
    >
      {initialsForName(name)}
    </div>
  )
}
