import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { LectureAssetsService } from "@/services/lectureAssets.service"
import type { SetFilesToLectureRequest } from "@/types/lectureAssets"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"
import { getLectureFilesQueryKey } from "@/queries/dashboard/lectures/useLectureFilesQuery"

export const useSetFilesToLectureMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, SetFilesToLectureRequest>({
    mutationFn: (payload) => LectureAssetsService.setFilesToLecture(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getLectureFilesQueryKey({ lectureId: variables.lectureId }))
    },
    onError: queryOrMutationDefaultOnError,
  })
}