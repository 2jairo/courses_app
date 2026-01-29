// src/services/CoursesService.ts
import { http } from "@/lib/axiosInstance";
import { objectToParams } from "@/lib/objectToParams";
import type { DeleteUserPermissionsRequest, GetCourseMembersRequest, GetCourseMembersResponse, SetUserPermissionsRequest } from "@/types/dashboard/coursePermissions";

export class CoursePermissionsService {
  static async setUserPermissions(data: SetUserPermissionsRequest) {
    const { courseId, ...body } = data

    const response = await http.post(
      `${import.meta.env.VITE_A_SERVICE_URL}/course-permissions/${courseId}`, body
    )
    return response.data
  }

  static async deleteUserPermissions(data: DeleteUserPermissionsRequest) {
    const { courseId, ...body } = data

    const params = objectToParams(body).toString()

    const response = await http.delete(
      `${import.meta.env.VITE_A_SERVICE_URL}/course-permissions/${courseId}?${params}`
    )
    return response.data
  }

  static async getCourseMembers(data: GetCourseMembersRequest) {
    const response = await http.get<GetCourseMembersResponse[]>(
      `${import.meta.env.VITE_A_SERVICE_URL}/course-permissions/${data.courseId}`
    )
    return response.data
  }
}
