import { useQuery } from "react-query"
import type { AxiosError } from "axios"

import type { LocalErrorResponse } from "@/types/error"
import { UserUtilsService } from "@/services/userUtils.service"
import type { GetUsersByPrefixResponse } from "@/types/userUtils"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"

export const USERS_PREFIX_QUERY_KEY = "users_prefix"

export const getUsersByPrefixQueryKey = (prefix: string) => {
  return [USERS_PREFIX_QUERY_KEY, prefix] as const
}

export const useUsersByPrefixQuery = (prefix: string, enabled: boolean = false) => {
  return useQuery<GetUsersByPrefixResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getUsersByPrefixQueryKey(prefix),
    queryFn: () => UserUtilsService.getUsersByPrefix({ value: prefix }),
    enabled: enabled && prefix.length > 0,
    keepPreviousData: true,
    onError: queryOrMutationDefaultOnError
  })
}
