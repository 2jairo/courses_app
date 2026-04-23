import { http } from "@/lib/axiosInstance";
import type { WatchCourseAnalyticsRequest, WatchLectureAnalyticsRequest } from "@/types/client/analytics";
import type { AxiosRequestConfig } from "axios";
export class ClientAnalyticsService {
  static async trackCourseView(data: WatchCourseAnalyticsRequest, config?: AxiosRequestConfig) {
    const { courseId, ...body } = data

    const response = await http.post<void>(
      `${import.meta.env.VITE_D_SERVICE_URL}/analytics/watch/course/${courseId}`, 
      body,
      config
    )
    return response.data
  }

  static async trackLectureView(data: WatchLectureAnalyticsRequest, config?: AxiosRequestConfig) {
    const { lectureId, ...body } = data

    const response = await http.post<void>(
      `${import.meta.env.VITE_D_SERVICE_URL}/analytics/watch/lecture/${lectureId}`, 
      body,
      config
    )
    return response.data
  }
}
