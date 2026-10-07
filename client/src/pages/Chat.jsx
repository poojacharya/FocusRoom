import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, MessagesSquare, Send, UsersRound } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { useAuthStore } from '../store/useAuthStore'
import { useDirectMessagesQuery, useFriendsQuery, useSendDirectMessage } from '../hooks/useFriends'

function formatMessageTime(isoString) {
  const date = new Date(isoString)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export default function Chat() {
  const { data: friends = [], isLoading, isError } = useFriendsQuery()
  const currentUserId = useAuthStore((s) => s.user?._id)
  const [selectedFriendId, setSelectedFriendId] = useState('')
  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!friends.length) {
      setSelectedFriendId('')
      return
    }

    setSelectedFriendId((current) =>
      friends.some((friend) => friend.user._id === current) ? current : friends[0].user._id,
    )
  }, [friends])

  const selectedFriend = useMemo(
    () => friends.find((friend) => friend.user._id === selectedFriendId) ?? null,
    [friends, selectedFriendId],
  )
  const {
    data: messages = [],
    isLoading: isMessagesLoading,
    isError: isMessagesError,
  } = useDirectMessagesQuery(selectedFriendId)
  const sendMessage = useSendDirectMessage(selectedFriendId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, selectedFriendId])

  const handleSubmit = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text || sendMessage.isPending) return
    sendMessage.mutate(text, { onSuccess: () => setDraft('') })
  }

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <SectionHeader title="Chat" subtitle="Loading your direct messages" />
        <Card className="h-80 animate-pulse bg-gray-100 dark:bg-white/5" />
      </PageContainer>
    )
  }

  if (isError) {
    return (
      <PageContainer>
        <SectionHeader title="Chat" subtitle="Direct messages with friends" />
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Couldn&apos;t load your friends. Please try again.
          </p>
        </Card>
      </PageContainer>
    )
  }

  if (friends.length === 0) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            icon={MessagesSquare}
            title="No direct messages yet"
            description="Add friends first so you can chat privately."
            action={
              <Link to="/friends">
                <Button type="button" variant="secondary">Find friends</Button>
              </Link>
            }
          />
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <SectionHeader title="Chat" subtitle="Private conversations with your friends" />

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card padding="none" className="overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-white/10">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <MessageSquare className="h-4 w-4 text-brand-500" />
              Direct messages
            </div>
          </div>
          <div className="space-y-2 p-3">
            {friends.map((friend) => {
              const isSelected = friend.user._id === selectedFriendId
              return (
                <button
                  key={friend.friendshipId}
                  type="button"
                  onClick={() => setSelectedFriendId(friend.user._id)}
                  aria-pressed={isSelected}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                    isSelected
                      ? 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-100'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={friend.user.name} src={friend.user.avatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{friend.user.name}</p>
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                        {friend.user.email}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="border-t border-gray-200 p-3 dark:border-white/10">
            <Link to="/study-room">
              <Button type="button" variant="secondary" fullWidth>
                <UsersRound className="h-4 w-4" />
                Open study rooms
              </Button>
            </Link>
          </div>
        </Card>

        {selectedFriend && (
          <Card padding="none" className="flex h-[32rem] min-h-0 flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-white/10">
              <Avatar name={selectedFriend.user.name} src={selectedFriend.user.avatar} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedFriend.user.name}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Conversation saved automatically
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {isMessagesLoading ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading messages…</p>
              ) : isMessagesError ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Couldn&apos;t load this conversation.
                </p>
              ) : messages.length === 0 ? (
                <EmptyState
                  icon={MessagesSquare}
                  title="No messages yet"
                  description={`Send ${selectedFriend.user.name} a message to start chatting.`}
                />
              ) : (
                messages.map((message) => {
                  const isMine = String(message.sender?._id) === String(currentUserId)
                  return (
                    <div key={message._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[80%]">
                        <div className={`rounded-2xl px-3 py-2 text-sm ${
                          isMine
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-100'
                        }`}>
                          {message.content}
                        </div>
                        <div className={`mt-1 text-[11px] ${
                          isMine ? 'text-right text-gray-400' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {formatMessageTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex shrink-0 items-end gap-2 border-t border-gray-100 bg-white p-3 dark:border-white/10 dark:bg-gray-950">
              <label htmlFor="direct-message-input" className="sr-only">Message</label>
              <textarea
                id="direct-message-input"
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder={`Message ${selectedFriend.user.name}…`}
                maxLength={2000}
                className="min-h-11 min-w-0 flex-1 resize-y rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:bg-white/10"
                aria-label={`Message ${selectedFriend.user.name}`}
              />
              <Button
                type="submit"
                aria-label="Send message"
                fullWidth={false}
                className="h-11 w-11 shrink-0 p-0"
                disabled={!draft.trim() || sendMessage.isPending}
                isLoading={sendMessage.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
