import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { FilesService } from "@/services/files.service"
import type { UploadFilesResponse, UploadImageRequest } from "@/types/dashboard/files"
import type { LocalErrorResponse } from "@/types/error"
import { FILES_QUERY_KEY } from "@/queries/dashboard/files/useFilesQuery"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const useUploadImageMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<UploadFilesResponse, AxiosError<LocalErrorResponse>, UploadImageRequest>({
    mutationFn: (payload) => FilesService.uploadImage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(FILES_QUERY_KEY)
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, '/dashboard/courses'),
  })
}
