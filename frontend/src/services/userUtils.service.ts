import { http } from "@/lib/axiosInstance";
import type { GetUsersByPrefixRequest, GetUsersByPrefixResponse } from "@/types/userUtils";

export class UserUtilsService {
  static async getUsersByPrefix(data: GetUsersByPrefixRequest) {
    const params = new URLSearchParams(Object.entries(data).map(([key, value]) => [key, String(value)])).toString();
    const response = await http.get<GetUsersByPrefixResponse[]>(
      `${import.meta.env.VITE_B_SERVICE_URL}/user/prefix?${params}`
    )
    return response.data
  }
}