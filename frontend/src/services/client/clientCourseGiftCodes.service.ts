import { http } from "@/lib/axiosInstance"
import type { CourseGiftCodeResponse, GetCourseGiftCodesRequest, RedeemGiftCodeRequest, RedeemGiftCodeResponse } from "@/types/client/courseGiftCodes"
import type { AxiosRequestConfig } from "axios"

export class ClientCourseGiftCodesService {
  static async getCourseGiftCodes(
    data: GetCourseGiftCodesRequest,
    config?: AxiosRequestConfig
  ) {
    const response = await http.get<CourseGiftCodeResponse[]>(
      `${import.meta.env.VITE_D_SERVICE_URL}/gift-codes/${data.orderId}/${data.courseId}`,
      config
    )
    return response.data
  }

  static async redeemGiftCode(
    data: RedeemGiftCodeRequest,
    config?: AxiosRequestConfig
  ) {
    const response = await http.post<RedeemGiftCodeResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/gift-codes/redeem`,
      data,
      config
    )
    return response.data
  }
}