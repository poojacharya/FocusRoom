import { useEffect, useState } from 'react'

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

export function Avatar({ name, src, size = 'md' }) {
  const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' }
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [src])

  if (src && !imageFailed) {
    return (
      <img
        src={src}
        alt={name || 'Profile'}
        onError={() => setImageFailed(true)}
        className={`shrink-0 rounded-full object-cover ring-2 ring-white/80 dark:ring-gray-950 ${sizes[size]}`}
      />
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorForName(name)} ${sizes[size]}`}
    >
      {initialsForName(name)}
    </div>
  )
}
