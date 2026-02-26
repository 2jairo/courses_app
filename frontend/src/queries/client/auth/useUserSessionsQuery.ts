import { useQuery } from "react-query"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"

import { ClientAuthService } from "@/services/client/clientAuth.service"
import type { UserAuthServiceGetUserSesssion } from "@/types/client/auth"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const USER_SESSIONS_QUERY_KEY = "user_sessions"

export const getUserSessionsQueryKey = () => {
  return [USER_SESSIONS_QUERY_KEY] as const
}

export const useUserSessionsQuery = () => {
  const navigate = useNavigate()

  return useQuery<UserAuthServiceGetUserSesssion[], AxiosError<LocalErrorResponse>>({
    queryKey: getUserSessionsQueryKey(),
    queryFn: ({ signal }) => ClientAuthService.getUserSessions({ signal }),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
