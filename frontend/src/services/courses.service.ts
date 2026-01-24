// src/services/CoursesService.ts
import { http } from "@/lib/axiosInstance";
import type { CourseResponse, CourseResponseExtended, CreateCourseRequest, DeleteCourseRequest, GetDashboardCourseDetailsRequest, GetDashboardCoursesRequest, UpdateCourseRequest } from "@/types/courses";

export class CoursesService {
  static async createCourse(payload: CreateCourseRequest) {
    const { data } = await http.post<CourseResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/courses/create`, payload
    )
    return data
  }

  static async getDashboardCourses(query: GetDashboardCoursesRequest) {
    const params = new URLSearchParams(
      Object.entries(query)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

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