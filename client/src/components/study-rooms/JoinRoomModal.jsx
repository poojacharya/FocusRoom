import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export function JoinRoomModal({ isOpen, onSubmit, onClose, isSubmitting }) {
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setRoomCode('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!roomCode.trim()) {
      setError('Room code is required')
      return
    }
    onSubmit(roomCode.trim())
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-room-title"
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-gray-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="join-room-title" className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Join a study room
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                label="Room code"
                placeholder="e.g. 7F3KQ9"
                value={roomCode}
                error={error}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase())
                  if (error) setError('')
                }}
                className="uppercase tracking-widest"
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" fullWidth={false} onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" fullWidth={false} isLoading={isSubmitting}>
                  Join room
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
