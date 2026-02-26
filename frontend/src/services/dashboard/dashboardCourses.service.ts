// src/services/CoursesService.ts
import { http } from "@/lib/axiosInstance";
import { objectToParams } from "@/lib/objectToParams";
import type { CourseResponse, CourseResponseExtended, CreateCourseRequest, DeleteCourseRequest, GetDashboardCourseDetailsRequest, GetDashboardCoursesRequest, UpdateCourseRequest } from "@/types/dashboard/courses"
import type { AxiosRequestConfig } from "axios";

export class DashboardCoursesService {
  static async createCourse(payload: CreateCourseRequest, config?: AxiosRequestConfig) {
    const { data } = await http.post<CourseResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/courses/create`, payload, config
    )
    return data
  }

  static async getDashboardCourses(query: GetDashboardCoursesRequest, config?: AxiosRequestConfig) {
    const params = objectToParams(query).toString()
    
    const response = await http.get<CourseResponse[]>(
      `${import.meta.env.VITE_A_SERVICE_URL}/courses?${params}`, config
    )
    return response.data
  }

  static async getDashboardCourseDetails(data: GetDashboardCourseDetailsRequest, config?: AxiosRequestConfig) {
    const response = await http.get<CourseResponseExtended>(
      `${import.meta.env.VITE_A_SERVICE_URL}/courses/${data.courseId}`, config
    )
    return response.data
  }

  static async updateCourse(payload: UpdateCourseRequest, config?: AxiosRequestConfig) {
    const { courseId, ...body } = payload

    const { data } = await http.put<CourseResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/courses/${courseId}`, body, config
    )
    return data
  }

  static async deleteCourse(data: DeleteCourseRequest, config?: AxiosRequestConfig) {
    await http.delete(
      `${import.meta.env.VITE_A_SERVICE_URL}/courses/${data.courseId}`, config
    )
  }
}