import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { ClientNotificationsService } from "@/services/client/clientNotifications.service"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { getNotificationsQueryKey } from "@/queries/client/notifications/useNotificationsQuery"

export const useMarkNotificationsAsSeenMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, void>({
    mutationFn: () => ClientNotificationsService.markNotificationsAsSeen(),
    onSuccess: () => {
      queryClient.invalidateQueries(getNotificationsQueryKey({}))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
