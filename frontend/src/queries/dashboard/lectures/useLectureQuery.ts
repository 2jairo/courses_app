import { useQuery } from "react-query"
import type { AxiosError } from "axios"

import { LecturesService } from "@/services/lectures.service"
import type { LectureResponse, GetLectureRequest } from "@/types/lectures"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"

export const LECTURE_QUERY_KEY = "lecture"

export const getLectureQueryKey = (data: GetLectureRequest) => {
  return [LECTURE_QUERY_KEY, data] as const
}

export const useLectureQuery = (data: GetLectureRequest) => {
  return useQuery<LectureResponse, AxiosError<LocalErrorResponse>>({
    queryKey: getLectureQueryKey(data),
    queryFn: () => LecturesService.getLecture(data),
    onError: queryOrMutationDefaultOnError,
    enabled: data.lectureId !== null && data.lectureId > 0,
  })
}
