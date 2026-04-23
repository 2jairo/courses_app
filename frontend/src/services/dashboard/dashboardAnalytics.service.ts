import { http } from "@/lib/axiosInstance"
import type { GetCourseAnalyticsCompactResponse, GetCourseAnalyticsRequest } from "@/types/dashboard/analytics"
import type { AxiosRequestConfig } from "axios"

export class DashboardAnalyticsService {
  static async getCourseAnalytics(data: GetCourseAnalyticsRequest, config?: AxiosRequestConfig) {
    const response = await http.get<GetCourseAnalyticsCompactResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/analytics/${data.courseId}`,
      config
    )

    return response.data
  }
}
