import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { CoursePermissionsService } from "@/services/coursePermissions.service"
import type { DeleteUserPermissionsRequest } from "@/types/coursePermissions"
import type { LocalErrorResponse } from "@/types/error"
import { getDashboardCoursePermissionsQueryKey } from "@/queries/dashboard/coursePermissions/useCoursePermissions"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationDefaultOnError"

export const useDeleteUserPermissionsMutation = () => {
  const queryClient = useQueryClient()

  const resp = useMutation<void, AxiosError<LocalErrorResponse>, DeleteUserPermissionsRequest>({
    mutationFn: (payload) => CoursePermissionsService.deleteUserPermissions(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getDashboardCoursePermissionsQueryKey({ courseId: variables.courseId })
      })
    },
    onError: queryOrMutationDefaultOnError
  })

  return resp
}