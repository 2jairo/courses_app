import type { AxiosError } from "axios"
import { useInfiniteQuery } from "react-query"
import { useNavigate } from "react-router-dom"

import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { ClientNotificationsService } from "@/services/client/clientNotifications.service"
import type { GetNotificationsRequest, NotificationResponse } from "@/types/client/notifications"
import type { LocalErrorResponse } from "@/types/error"

export const NOTIFICATIONS_QUERY_KEY = "client_notifications"
export const NOTIFICATIONS_PAGE_SIZE = 15

export const getNotificationsQueryKey = (q: GetNotificationsRequest) => {
  return [NOTIFICATIONS_QUERY_KEY, q] as const
}

export const useNotificationsQuery = (q: GetNotificationsRequest, enabled?: boolean) => {
  const navigate = useNavigate()

  return useInfiniteQuery<NotificationResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getNotificationsQueryKey(q),
    queryFn: ({ pageParam, signal }) =>
      ClientNotificationsService.getNotifications(
        {
          ...q,
          page: pageParam?.page || 1,
          size: pageParam?.size || NOTIFICATIONS_PAGE_SIZE,
        },
        { signal }
      ),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < NOTIFICATIONS_PAGE_SIZE
        ? undefined
        : {
          page: allPages.length + 1,
          size: NOTIFICATIONS_PAGE_SIZE,
        }
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, "/"),
    enabled
  })
}
