import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { CoursePermissionsService } from "@/services/coursePermissions.service"
import type { SetUserPermissionsRequest } from "@/types/coursePermissions"
import type { LocalErrorResponse } from "@/types/error"
import { getDashboardCoursePermissionsQueryKey } from "@/queries/dashboard/coursePermissions/useCoursePermissions"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"

export const useSetUserPermissionsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, SetUserPermissionsRequest>({
    mutationFn: (payload) => CoursePermissionsService.setUserPermissions(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getDashboardCoursePermissionsQueryKey({ courseId: variables.courseId })
      })
    },
    onError: queryOrMutationDefaultOnError
  })
}