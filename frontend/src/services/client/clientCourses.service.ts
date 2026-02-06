// src/services/CoursesService.ts
import { http } from "@/lib/axiosInstance";
import type { MarkLectureAsSeenRequest, ResetCourseProgressRequest, WatchCourseRequest, WatchCourseResponse } from "@/types/client/courses";
import type { AxiosRequestConfig } from "axios";

export class ClientCoursesService {
  static async watchCourse(data: WatchCourseRequest, config?: AxiosRequestConfig) {
    const response = await http.get<WatchCourseResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/courses/watch/${data.courseSlug}`, config
    )
    return response.data
  }

  static async markLectureAsSeen(data: MarkLectureAsSeenRequest, config?: AxiosRequestConfig) {
    const response = await http.post(
      `${import.meta.env.VITE_D_SERVICE_URL}/course-progress/mark-as-seen`,
      data,
      config
    )
    return response.data
  }

  static async resetCourseProgress(data: ResetCourseProgressRequest, config?: AxiosRequestConfig) {
    const response = await http.post(
      `${import.meta.env.VITE_D_SERVICE_URL}/course-progress/reset`,
      data,
      config
    )
    return response.data
  }
}