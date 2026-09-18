import { useIncomingRequestsQuery } from './useFriends'

export function useNotifications() {
  const { data: incomingRequests = [], isLoading, isError } = useIncomingRequestsQuery()

  return {
    data: {
      items: incomingRequests.map((request) => ({
        id: request.requestId,
        label: `${request.user.name} sent you a friend request`,
      })),
      unreadCount: incomingRequests.length,
    },
    isLoading,
    isError,
  }
}
