import { http } from "@/lib/axiosInstance"
import { objectToParams } from "@/lib/objectToParams"
import type { GetNotificationsRequest, NotificationResponse } from "@/types/client/notifications"
import type { Pagination } from "@/types/pagination"
import type { AxiosRequestConfig } from "axios"

export class ClientNotificationsService {
  static async getNotifications(data: GetNotificationsRequest & Pagination, config?: AxiosRequestConfig) {
    const params = objectToParams(data).toString()

    const response = await http.get<NotificationResponse[]>(
      `${import.meta.env.VITE_D_SERVICE_URL}/notifications?${params}`,
      config
    )

    return response.data
  }

  static async markNotificationsAsSeen(config?: AxiosRequestConfig) {
    await http.post(
      `${import.meta.env.VITE_D_SERVICE_URL}/notifications/mark-as-seen`,
      {},
      config
    )
  }
}
