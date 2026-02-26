import { http } from "@/lib/axiosInstance";
import { objectToParams } from "@/lib/objectToParams";
import type { GetUsersByPrefixRequest, GetUsersByPrefixResponse } from "@/types/dashboard/userUtils";
import type { AxiosRequestConfig } from "axios";

export class UserUtilsService {
  static async getUsersByPrefix(data: GetUsersByPrefixRequest, config?: AxiosRequestConfig) {
    const params = objectToParams(data).toString()
    
    const response = await http.get<GetUsersByPrefixResponse[]>(
      `${import.meta.env.VITE_B_SERVICE_URL}/user/prefix?${params}`, config
    )
    return response.data
  }
}