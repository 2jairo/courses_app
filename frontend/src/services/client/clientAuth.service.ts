import { http } from "@/lib/axiosInstance";
import type { UserAuthServicieLoginRequestBody, UserAuthServiceRegisterRequestBody, UserAuthServiceUserProfileResponse, UserAuthServiceLogoutRequestQuery, UserAuthServiceGetUserSesssion } from '@/types/client/auth';
import type { AxiosRequestConfig } from "axios";

export class ClientAuthService {
  static async login(data: UserAuthServicieLoginRequestBody, config?: AxiosRequestConfig): Promise<UserAuthServiceUserProfileResponse & { token: string }> {
    const response = await http.post(`${import.meta.env.VITE_B_SERVICE_URL}/auth/login`, data, { ...config, withCredentials: true });
    return response.data;
  }

  static async register(data: UserAuthServiceRegisterRequestBody, config?: AxiosRequestConfig): Promise<UserAuthServiceUserProfileResponse & { token: string }> {
    const response = await http.post(`${import.meta.env.VITE_B_SERVICE_URL}/auth/register`, data, { ...config, withCredentials: true })
    return response.data;
  }

  static async populate(config?: AxiosRequestConfig): Promise<UserAuthServiceUserProfileResponse> {
    const response = await http.get(`${import.meta.env.VITE_B_SERVICE_URL}/auth/user`, config)
    return response.data;
  }

  static async logout(payload: UserAuthServiceLogoutRequestQuery, config?: AxiosRequestConfig) {
    await http.post(
      `${import.meta.env.VITE_B_SERVICE_URL}/auth/logout?all_sessions=${payload.all_sessions}`,
      undefined,
      { ...config, withCredentials: true }
    )
  }

  static async getUserSessions(config?: AxiosRequestConfig) {
    const { data } = await http.get<UserAuthServiceGetUserSesssion[]>(
      `${import.meta.env.VITE_B_SERVICE_URL}/auth/sessions`,
      config
    )
    return data
  }
}