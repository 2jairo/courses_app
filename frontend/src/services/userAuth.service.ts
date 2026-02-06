import { http } from "@/lib/axiosInstance";
import type { UserAuthServicieLoginRequestBody, UserAuthServiceRegisterRequestBody, UserAuthServiceUserProfileResponse } from '@/types/user';
import type { AxiosRequestConfig } from "axios";

export class UserAuthService {
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

  static async logout(config?: AxiosRequestConfig): Promise<void> {
    const response = await http.post(`${import.meta.env.VITE_B_SERVICE_URL}/auth/logout`, undefined, { ...config, withCredentials: true });
    return response.data;
  }
}