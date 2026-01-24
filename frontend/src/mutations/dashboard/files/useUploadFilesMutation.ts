import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { FilesService } from "@/services/files.service"
import type { UploadFilesResponse, UploadFilesRequest } from "@/types/files"
import type { LocalErrorResponse } from "@/types/error"
import { FILES_QUERY_KEY } from "@/queries/dashboard/files/useFilesQuery"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"

export const useUploadFilesMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<UploadFilesResponse[], AxiosError<LocalErrorResponse>, UploadFilesRequest>({
    mutationFn: (payload) => FilesService.uploadFiles(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(FILES_QUERY_KEY)
    },
    onError: queryOrMutationDefaultOnError,
  })
}
