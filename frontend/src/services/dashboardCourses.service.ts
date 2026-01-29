// src/services/CoursesService.ts
import { http } from "@/lib/axiosInstance";
import { objectToParams } from "@/lib/objectToParams";
import type { CourseResponse, CourseResponseExtended, CreateCourseRequest, DeleteCourseRequest, GetDashboardCourseDetailsRequest, GetDashboardCoursesRequest, UpdateCourseRequest } from "@/types/dashboard/courses"

export class DashboardCoursesService {
  static async createCourse(payload: CreateCourseRequest) {
    const { data } = await http.post<CourseResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/courses/create`, payload
    )
    return data
  }

  static async getDashboardCourses(query: GetDashboardCoursesRequest) {
    const params = objectToParams(query).toString()
    
    const response = await http.get<CourseResponse[]>(
      `${import.meta.env.VITE_A_SERVICE_URL}/courses?${params}`
    )
    return response.data
  }

  static async getDashboardCourseDetails(data: GetDashboardCourseDetailsRequest) {
    const response = await http.get<CourseResponseExtended>(
      `${import.meta.env.VITE_A_SERVICE_URL}/courses/${data.courseId}`
    )
    return response.data
  }

  static async updateCourse(payload: UpdateCourseRequest) {
    const { courseId, ...body } = payload

    const { data } = await http.put<CourseResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/courses/${courseId}`, body
    )
    return data
  }

  static async deleteCourse(data: DeleteCourseRequest) {
    await http.delete(
      `${import.meta.env.VITE_A_SERVICE_URL}/courses/${data.courseId}`
    )
  }
}