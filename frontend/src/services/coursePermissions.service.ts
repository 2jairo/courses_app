// src/services/CoursesService.ts
import { http } from "@/lib/axiosInstance";
import { objectToParams } from "@/lib/objectToParams";
import type { DeleteUserPermissionsRequest, GetCourseMembersRequest, GetCourseMembersResponse, SetUserPermissionsRequest } from "@/types/dashboard/coursePermissions";
import type { AxiosRequestConfig } from "axios";

export class CoursePermissionsService {
  static async setUserPermissions(data: SetUserPermissionsRequest, config?: AxiosRequestConfig) {
    const { courseId, ...body } = data

    const response = await http.post(
      `${import.meta.env.VITE_A_SERVICE_URL}/course-permissions/${courseId}`, body, config
    )
    return response.data
  }

  static async deleteUserPermissions(data: DeleteUserPermissionsRequest, config?: AxiosRequestConfig) {
    const { courseId, ...body } = data

    const params = objectToParams(body).toString()

    const response = await http.delete(
      `${import.meta.env.VITE_A_SERVICE_URL}/course-permissions/${courseId}?${params}`, config
    )
    return response.data
  }

  static async getCourseMembers(data: GetCourseMembersRequest, config?: AxiosRequestConfig) {
    const response = await http.get<GetCourseMembersResponse[]>(
      `${import.meta.env.VITE_A_SERVICE_URL}/course-permissions/${data.courseId}`, config
    )
    return response.data
  }
}
