import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { CoursePermissionsService } from "@/services/coursePermissions.service"
import type { SetUserPermissionsRequest } from "@/types/dashboard/coursePermissions"
import type { LocalErrorResponse } from "@/types/error"
import { getDashboardCoursePermissionsQueryKey } from "@/queries/dashboard/coursePermissions/useCoursePermissions"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { useNavigate } from "react-router-dom"

export const useSetUserPermissionsMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, SetUserPermissionsRequest>({
    mutationFn: (payload) => CoursePermissionsService.setUserPermissions(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getDashboardCoursePermissionsQueryKey({ courseId: variables.courseId })
      })
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, '/dashboard/courses')
  })
}