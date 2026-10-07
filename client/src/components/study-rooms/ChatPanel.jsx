import { useEffect, useRef, useState } from 'react'
import { Send, MessageSquare, Paperclip } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { EmptyState } from '../ui/EmptyState'
import { Avatar } from '../ui/Avatar'
import { useStudyRoomChat } from '../../hooks/useStudyRoomChat'
import { readAttachments, showAttachmentError } from '../../lib/attachments'
import { showErrorToast } from '../../lib/toast'

function formatMessageTime(isoString) {
  return new Date(isoString).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

/**
 * Study Room chat panel, wired to the existing Socket.IO backend (see
 * hooks/useStudyRoomChat.js and server/src/sockets/studyRoomSocket.js)
 * — messages are sent and received live via the `studyRoom:join` /
 * `studyRoom:sendMessage` / `studyRoom:receiveMessage` events, then loaded
 * from the room's persisted history when the panel is opened again.
 */
export function ChatPanel({ roomId }) {
  const { messages, status, sendMessage } = useStudyRoomChat(roomId)
  const [draft, setDraft] = useState('')
  const [attachments, setAttachments] = useState([])
  const fileInputRef = useRef(null)
  const scrollRef = useRef(null)

  // Auto-scroll to the newest message whenever the list grows.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!draft.trim() && attachments.length === 0) return
    sendMessage(draft, attachments, (sent) => {
      if (!sent) return
      setDraft('')
      setAttachments([])
    })
  }

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  const readSelectedFiles = async (files) => {
    try {
      const filesAsAttachments = await readAttachments(files)
      const currentSize = attachments.reduce((total, item) => total + item.data.length * 0.75, 0)
      const addedSize = filesAsAttachments.reduce((total, item) => total + item.data.length * 0.75, 0)
      if (currentSize + addedSize > 5 * 1024 * 1024) {
        throw new Error('Attachments must total 5 MB or less')
      }
      setAttachments((current) => [...current, ...filesAsAttachments])
    } catch (error) {
      showErrorToast(showAttachmentError(error))
    }
  }

  const handlePaste = (event) => {
    const files = Array.from(event.clipboardData?.items || [])
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter(Boolean)
    if (files.length === 0) return
    event.preventDefault()
    readSelectedFiles(files)
  }

  const isConnected = status === 'joined'

  return (
    <Card padding="none" className="flex h-[28rem] min-h-0 flex-col">
      <SectionHeader
        title="Chat"
        subtitle={
          status === 'joined' ? 'Study room conversation' : status === 'error' ? 'Disconnected' : 'Connecting…'
        }
        className="px-4 pt-4"
      />

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
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
            <div key={message._id || `${message.sentAt}-${index}`} className="flex items-start gap-2.5">
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
                <div className="mt-0.5 whitespace-pre-wrap break-words rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-800 dark:bg-white/10 dark:text-gray-100">
                  {message.text && <p>{message.text}</p>}
                  {message.attachments?.map((attachment, attachmentIndex) => (
                    <div key={`${attachment.name}-${attachmentIndex}`} className="mt-2">
                      {attachment.type.startsWith('image/') ? (
                        <a href={attachment.data} target="_blank" rel="noreferrer">
                          <img src={attachment.data} alt={attachment.name} className="max-h-56 max-w-full rounded-lg object-contain" />
                        </a>
                      ) : attachment.type === 'application/pdf' ? (
                        <iframe
                          src={attachment.data}
                          title={attachment.name}
                          className="h-56 w-full rounded-lg bg-white"
                        />
                      ) : (
                        <a
                          href={attachment.data}
                          download={attachment.name}
                          className="underline"
                        >
                          {attachment.name}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {attachments.length > 0 && (
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-gray-100 px-3 py-2 dark:border-white/10">
          {attachments.map((attachment, index) => (
            <span
              key={`${attachment.name}-${index}`}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-white/10 dark:text-gray-200"
            >
              {attachment.name}
              <button
                type="button"
                aria-label={`Remove ${attachment.name}`}
                onClick={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                className="text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-end gap-2 border-t border-gray-100 bg-white p-3 dark:border-white/10 dark:bg-gray-950"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          onChange={(event) => {
            readSelectedFiles(Array.from(event.target.files || []))
            event.target.value = ''
          }}
          className="hidden"
        />
        <button
          type="button"
          aria-label="Attach images or documents"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <label htmlFor="study-room-chat-input" className="sr-only">
          Message
        </label>
        <textarea
          id="study-room-chat-input"
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleComposerKeyDown}
          onPaste={handlePaste}
          placeholder="Type a message…"
          maxLength={2000}
          aria-label="Type a message"
          className="min-h-10 min-w-0 flex-1 resize-y rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-brand-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:focus:bg-white/10"
        />
        <button
          type="submit"
          disabled={!isConnected || (!draft.trim() && attachments.length === 0)}
          aria-label="Send message"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </Card>
  )
}
