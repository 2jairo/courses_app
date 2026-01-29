import { http } from "@/lib/axiosInstance";
import { objectToParams } from "@/lib/objectToParams";
import type { GetUsersByPrefixRequest, GetUsersByPrefixResponse } from "@/types/userUtils";

export class UserUtilsService {
  static async getUsersByPrefix(data: GetUsersByPrefixRequest) {
    const params = objectToParams(data).toString()
    
    const response = await http.get<GetUsersByPrefixResponse[]>(
      `${import.meta.env.VITE_B_SERVICE_URL}/user/prefix?${params}`
    )
    return response.data
  }
}