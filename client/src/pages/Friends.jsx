import { useState } from 'react'
import { Search, Users2, Inbox } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonLine } from '../components/ui/Skeleton'
import { UserSearchResultItem } from '../components/friends/UserSearchResultItem'
import { FriendRequestItem } from '../components/friends/FriendRequestItem'
import { FriendListItem } from '../components/friends/FriendListItem'
import {
  useFriendsQuery,
  useIncomingRequestsQuery,
  useUserSearch,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
} from '../hooks/useFriends'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

const MIN_QUERY_LENGTH = 2

export default function Friends() {
  // No dedicated UI store here (unlike Notes/Tasks/Calendar) — the only
  // transient view state on this page is the search text, which doesn't
  // need to be shared with any other component, so plain local state is
  // enough. Same reasoning SearchBar.jsx already uses for the navbar
  // search box.
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const showSearchResults = debouncedQuery.trim().length >= MIN_QUERY_LENGTH

  const { data: searchResults = [], isFetching: isSearching } = useUserSearch(debouncedQuery)
  const { data: friends = [], isLoading: isLoadingFriends, isError: isFriendsError } = useFriendsQuery()
  const {
    data: incomingRequests = [],
    isLoading: isLoadingRequests,
    isError: isRequestsError,
  } = useIncomingRequestsQuery()

  const sendRequest = useSendFriendRequest()
  const acceptRequest = useAcceptFriendRequest()
  const rejectRequest = useRejectFriendRequest()
  const removeFriend = useRemoveFriend()

  const isRespondingToRequest = acceptRequest.isPending || rejectRequest.isPending
  const isMutatingInSearch = sendRequest.isPending || isRespondingToRequest

  return (
    <PageContainer>
      <SectionHeader title="Friends" subtitle="Find classmates and manage your connections" />

      <Card className="mb-4">
        <SectionHeader title="Find people" subtitle="Search by name or email" />
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            aria-label="Search for people"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-brand-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:focus:bg-white/10"
          />
        </div>

        {showSearchResults &&
          (isSearching ? (
            <div className="space-y-2 px-1">
              <SkeletonLine className="h-12 w-full" />
              <SkeletonLine className="h-12 w-full" />
            </div>
          ) : searchResults.length === 0 ? (
            <EmptyState icon={Search} title="No matches" description="Try a different name or email." />
          ) : (
            <ul className="space-y-1">
              {searchResults.map((user) => (
                <UserSearchResultItem
                  key={user._id}
                  user={user}
                  onSendRequest={(id) => sendRequest.mutate(id)}
                  onAccept={(id) => acceptRequest.mutate(id)}
                  onReject={(id) => rejectRequest.mutate(id)}
                  isMutating={isMutatingInSearch}
                />
              ))}
            </ul>
          ))}
      </Card>

      <Card className="mb-4">
        <SectionHeader title="Requests" subtitle="People who want to connect with you" />
        {isLoadingRequests ? (
          <div className="space-y-2">
            <SkeletonLine className="h-12 w-full" />
            <SkeletonLine className="h-12 w-full" />
          </div>
        ) : isRequestsError ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Couldn&apos;t load requests right now.</p>
        ) : incomingRequests.length === 0 ? (
          <EmptyState icon={Inbox} title="No pending requests" description="You're all caught up." />
        ) : (
          <ul className="space-y-1">
            {incomingRequests.map((request) => (
              <FriendRequestItem
                key={request.requestId}
                request={request}
                onAccept={(id) => acceptRequest.mutate(id)}
                onReject={(id) => rejectRequest.mutate(id)}
                isMutating={isRespondingToRequest}
              />
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <SectionHeader
          title="Your friends"
          subtitle={`${friends.length} connection${friends.length === 1 ? '' : 's'}`}
        />
        {isLoadingFriends ? (
          <div className="space-y-2">
            <SkeletonLine className="h-12 w-full" />
            <SkeletonLine className="h-12 w-full" />
            <SkeletonLine className="h-12 w-full" />
          </div>
        ) : isFriendsError ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Couldn&apos;t load your friends right now.</p>
        ) : friends.length === 0 ? (
          <EmptyState
            icon={Users2}
            title="No friends yet"
            description="Search for classmates above and send a request to get started."
          />
        ) : (
          <ul className="space-y-1">
            {friends.map((friend) => (
              <FriendListItem
                key={friend.friendshipId}
                friend={friend}
                onRemove={(id) => removeFriend.mutate(id)}
                isRemoving={removeFriend.isPending}
              />
            ))}
          </ul>
        )}
      </Card>
    </PageContainer>
  )
}
