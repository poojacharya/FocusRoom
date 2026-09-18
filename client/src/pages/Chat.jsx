import { useEffect, useMemo, useState } from 'react'
import { MessageSquare, MessagesSquare, Video } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { useFriendsQuery } from '../hooks/useFriends'

const demoMessagesByFriend = {
  default: [
    { _id: 'm1', sender: 'Them', text: 'Hey! Are you free to review the chemistry notes later?', time: '9:41 AM' },
    { _id: 'm2', sender: 'You', text: 'Yes — I can do 7:30 tonight.', time: '9:42 AM' },
    { _id: 'm3', sender: 'Them', text: 'Perfect. I’ll bring the practice set.', time: '9:43 AM' },
  ],
}

function formatMessageTime(isoString) {
  return new Date(isoString).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export default function Chat() {
  const { data: friends = [], isLoading, isError } = useFriendsQuery()
  const [selectedFriendId, setSelectedFriendId] = useState('')

  useEffect(() => {
    if (!friends.length) {
      setSelectedFriendId('')
      return
    }

    setSelectedFriendId((current) => {
      if (current && friends.some((friend) => friend.friendshipId === current)) return current
      return friends[0].friendshipId
    })
  }, [friends])

  const selectedFriend = useMemo(
    () => friends.find((friend) => friend.friendshipId === selectedFriendId) ?? null,
    [friends, selectedFriendId],
  )

  const selectedMessages = useMemo(() => {
    if (!selectedFriend) return []
    const baseMessages = demoMessagesByFriend[selectedFriend.friendshipId] ?? demoMessagesByFriend.default
    return baseMessages.map((message) => ({
      ...message,
      sentAt: message.sentAt ?? new Date().toISOString(),
      sender: message.sender === 'You' ? { name: 'You' } : { name: selectedFriend.user.name },
    }))
  }, [selectedFriend])

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
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Couldn&apos;t load your messages right now.</p>
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
            description="Add friends first so you can chat privately and call them from your study sessions."
            action={
              <Button type="button" variant="secondary" onClick={() => window.location.assign('/friends')}>
                Find friends
              </Button>
            }
          />
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <SectionHeader title="Chat" subtitle="Direct messages with friends" />

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
              const isSelected = friend.friendshipId === selectedFriendId

              return (
                <button
                  key={friend.friendshipId}
                  type="button"
                  onClick={() => setSelectedFriendId(friend.friendshipId)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                    isSelected
                      ? 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-100'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={friend.user.name} src={friend.user.avatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{friend.user.name}</span>
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-label="Online" />
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{friend.user.email}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="border-t border-gray-200 p-3 dark:border-white/10">
            <Button type="button" variant="secondary" fullWidth onClick={() => window.location.assign('/study-room')}>
              Open study rooms
            </Button>
          </div>
        </Card>

        {selectedFriend ? (
          <Card padding="none" className="flex h-[32rem] flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
              <div className="flex items-center gap-3">
                <Avatar name={selectedFriend.user.name} src={selectedFriend.user.avatar} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedFriend.user.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Available for a study call</p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-100"
              >
                <Video className="h-3.5 w-3.5" />
                Call
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {selectedMessages.map((message) => {
                const isMine = message.sender?.name === 'You'

                return (
                  <div key={message._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-2xl px-3 py-2 text-sm ${isMine ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-100'}`}>
                        {message.text}
                      </div>
                      <div className={`mt-1 text-[11px] ${isMine ? 'text-right text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {formatMessageTime(message.sentAt)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-gray-100 p-3 dark:border-white/10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Send a message…"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
                <Button type="button" variant="primary" className="px-3.5">
                  Send
                </Button>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </PageContainer>
  )
}
