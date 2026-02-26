import { useNavigate } from "react-router-dom"
import { useInfiniteQuery } from "react-query"
import type { AxiosError } from "axios"

import { FilesService } from "@/services/dashboard/files.service"
import type { UploadFilesResponse, GetFilesRequest } from "@/types/dashboard/files"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const FILES_QUERY_KEY = "files"
export const FILES_PAGE_SIZE = 15

export const getFilesQueryKey = (q: GetFilesRequest) => {
  return [FILES_QUERY_KEY, q] as const
}

export const useFilesQuery = (q: GetFilesRequest) => {
  const navigate = useNavigate()
  
  return useInfiniteQuery<UploadFilesResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getFilesQueryKey(q),
    queryFn: ({ pageParam, signal }) => FilesService.getFiles({
      ...q,
      page: pageParam?.page || 1,
      size: pageParam?.size || FILES_PAGE_SIZE
    }, { signal }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < FILES_PAGE_SIZE ? undefined : {
        page: allPages.length +1,
        size: FILES_PAGE_SIZE
      }
    },
    enabled: !!q.courseId,
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, '/dashboard/courses'),
  })
}
