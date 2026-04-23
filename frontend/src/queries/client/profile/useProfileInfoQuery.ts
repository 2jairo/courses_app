import { useQuery } from "react-query"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"

import { ClientProfileService } from "@/services/client/clientProfile.service"
import type { ProfileUserInfoResponse } from "@/types/client/profile"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const PROFILE_INFO_QUERY_KEY = "profile_info"

export const getProfileInfoQueryKey = () => {
  return [PROFILE_INFO_QUERY_KEY] as const
}

export const useProfileInfoQuery = () => {
  const navigate = useNavigate()

  return useQuery<ProfileUserInfoResponse, AxiosError<LocalErrorResponse>>({
    queryKey: getProfileInfoQueryKey(),
    queryFn: ({ signal }) => ClientProfileService.getUserInfo({ signal }),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
