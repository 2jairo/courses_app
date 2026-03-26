import { useQuery } from "react-query"
import type { AxiosError } from "axios"

import { ClientCourseGiftCodesService } from "@/services/client/clientCourseGiftCodes.service"
import type { CourseGiftCodeResponse, GetCourseGiftCodesRequest } from "@/types/client/courseGiftCodes"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { useNavigate } from "react-router-dom"

export const COURSE_GIFT_CODES_QUERY_KEY = "course_gift_codes"

export const getCourseGiftCodesQueryKey = (data: GetCourseGiftCodesRequest) => {
  return [COURSE_GIFT_CODES_QUERY_KEY, data] as const
}

export const useGetCourseGiftCodesQuery = (data: GetCourseGiftCodesRequest, enabled?: boolean) => {
  const navigate = useNavigate()

  return useQuery<CourseGiftCodeResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getCourseGiftCodesQueryKey(data),
    queryFn: ({ signal }) => ClientCourseGiftCodesService.getCourseGiftCodes(data, { signal }),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
    enabled: enabled
  })
}
