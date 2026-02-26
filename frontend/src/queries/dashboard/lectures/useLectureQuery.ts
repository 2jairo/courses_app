import { useNavigate } from "react-router-dom"
import { useQuery } from "react-query"
import type { AxiosError } from "axios"

import { LecturesService } from "@/services/dashboard/lectures.service"
import type { LectureResponse, GetLectureRequest } from "@/types/dashboard/lectures"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const LECTURE_QUERY_KEY = "lecture"

export const getLectureQueryKey = (data: GetLectureRequest) => {
  return [LECTURE_QUERY_KEY, data] as const
}

export const useLectureQuery = (data: GetLectureRequest) => {
  const navigate = useNavigate()
  
  return useQuery<LectureResponse, AxiosError<LocalErrorResponse>>({
    queryKey: getLectureQueryKey(data),
    queryFn: ({ signal }) => LecturesService.getLecture(data, { signal }),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, '/dashboard/courses'),
    enabled: data.lectureId !== null && data.lectureId > 0,
  })
}
