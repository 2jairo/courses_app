import { http } from "@/lib/axiosInstance";
import type { UserAuthServicieLoginRequestBody, UserAuthServiceRegisterRequestBody, UserAuthServiceUserProfileResponse } from '@/types/user';

export class UserAuthService {
  static async login(data: UserAuthServicieLoginRequestBody): Promise<UserAuthServiceUserProfileResponse & { token: string }> {
    const response = await http.post(`${import.meta.env.VITE_B_SERVICE_URL}/auth/login`, data, { withCredentials: true });
    return response.data;
  }

  static async register(data: UserAuthServiceRegisterRequestBody): Promise<UserAuthServiceUserProfileResponse & { token: string }> {
    const response = await http.post(`${import.meta.env.VITE_B_SERVICE_URL}/auth/register`, data, { withCredentials: true })
    return response.data;
  }

  static async populate(): Promise<UserAuthServiceUserProfileResponse> {
    const response = await http.get(`${import.meta.env.VITE_B_SERVICE_URL}/auth/user`)
    return response.data;
  }

  static async logout(): Promise<void> {
    const response = await http.post(`${import.meta.env.VITE_B_SERVICE_URL}/auth/logout`, undefined, { withCredentials: true });
    return response.data;
  }
}