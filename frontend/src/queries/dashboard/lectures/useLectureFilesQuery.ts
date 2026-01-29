import { useNavigate } from "react-router-dom"
import { useQuery } from "react-query"
import type { AxiosError } from "axios"

import { LectureAssetsService } from "@/services/lectureAssets.service"
import type { GetLectureFilesRequest, LectureFileResponse } from "@/types/dashboard/lectureAssets"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const LECTURE_FILES_QUERY_KEY = "lecture_files"

export const getLectureFilesQueryKey = (data: GetLectureFilesRequest) => {
  return [LECTURE_FILES_QUERY_KEY, data] as const
}

export const useLectureFilesQuery = (data: GetLectureFilesRequest) => {
  const navigate = useNavigate()
  
  return useQuery<LectureFileResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getLectureFilesQueryKey(data),
    queryFn: () => LectureAssetsService.getLectureFiles(data),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, '/dashboard/courses'),
    enabled: data.lectureId !== null && data.lectureId > 0,
  })
}