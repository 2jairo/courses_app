import { http } from "@/lib/axiosInstance";
import type { WatchCourseAnalyticsRequest } from "@/types/client/analytics";
import type { AxiosRequestConfig } from "axios";

export class ClientAnalyticsService {
  static async trackCourseView(data: WatchCourseAnalyticsRequest, config?: AxiosRequestConfig) {
    const response = await http.post(
      `${import.meta.env.VITE_D_SERVICE_URL}/analytics/courses/watch/${data.courseId}`, 
      {},
      config
    )
    return response.data
  }
}
