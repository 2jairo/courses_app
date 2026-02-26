import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { CoursePermissionsService } from "@/services/dashboard/coursePermissions.service"
import type { DeleteUserPermissionsRequest } from "@/types/dashboard/coursePermissions"
import type { LocalErrorResponse } from "@/types/error"
import { getDashboardCoursePermissionsQueryKey } from "@/queries/dashboard/coursePermissions/useCoursePermissions"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { useNavigate } from "react-router-dom"

export const useDeleteUserPermissionsMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const resp = useMutation<void, AxiosError<LocalErrorResponse>, DeleteUserPermissionsRequest>({
    mutationFn: (payload) => CoursePermissionsService.deleteUserPermissions(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getDashboardCoursePermissionsQueryKey({ courseId: variables.courseId })
      })
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, '/dashboard/courses')
  })

  return resp
}