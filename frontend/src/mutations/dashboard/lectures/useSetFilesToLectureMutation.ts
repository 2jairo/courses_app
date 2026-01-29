import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { LectureAssetsService } from "@/services/lectureAssets.service"
import type { SetFilesToLectureRequest } from "@/types/dashboard/lectureAssets"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { getLectureFilesQueryKey } from "@/queries/dashboard/lectures/useLectureFilesQuery"

export const useSetFilesToLectureMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, SetFilesToLectureRequest>({
    mutationFn: (payload) => LectureAssetsService.setFilesToLecture(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getLectureFilesQueryKey({ lectureId: variables.lectureId }))
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, '/dashboard/courses'),
  })
}