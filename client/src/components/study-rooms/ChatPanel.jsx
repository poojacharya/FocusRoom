import { useEffect, useRef, useState } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { EmptyState } from '../ui/EmptyState'
import { Avatar } from '../ui/Avatar'
import { useStudyRoomChat } from '../../hooks/useStudyRoomChat'

function formatMessageTime(isoString) {
  return new Date(isoString).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

/**
 * Study Room chat panel, wired to the existing Socket.IO backend (see
 * hooks/useStudyRoomChat.js and server/src/sockets/studyRoomSocket.js)
 * — messages are sent and received live via the `studyRoom:join` /
 * `studyRoom:sendMessage` / `studyRoom:receiveMessage` events. Still
 * nothing persisted: the message list only lives for as long as this
 * panel stays mounted, per this phase's scope.
 */
export function ChatPanel({ roomId }) {
  const { messages, status, sendMessage } = useStudyRoomChat(roomId)
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)

  // Auto-scroll to the newest message whenever the list grows.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!draft.trim()) return
    sendMessage(draft)
    setDraft('')
  }

  const isConnected = status === 'joined'

  return (
    <Card padding="none" className="flex h-[28rem] flex-col">
      <SectionHeader
        title="Chat"
        subtitle={
          status === 'joined' ? 'Study room conversation' : status === 'error' ? 'Disconnected' : 'Connecting…'
        }
        className="px-4 pt-4"
      />

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              description="Say hello to get the conversation started."
            />
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={`${message.sentAt}-${index}`} className="flex items-start gap-2.5">
              <Avatar name={message.sender?.name} size="sm" />
              <div className="min-w-0 max-w-[75%]">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                    {message.sender?.name || 'Someone'}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    {formatMessageTime(message.sentAt)}
                  </span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap break-words rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-800 dark:bg-white/10 dark:text-gray-100">
                  {message.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-gray-100 p-3 dark:border-white/10"
      >
        <label htmlFor="study-room-chat-input" className="sr-only">
          Message
        </label>
        <input
          id="study-room-chat-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={isConnected ? 'Type a message…' : 'Connecting…'}
          disabled={!isConnected}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-brand-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:focus:bg-white/10"
        />
        <button
          type="submit"
          disabled={!isConnected || !draft.trim()}
          aria-label="Send message"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </Card>
  )
}
