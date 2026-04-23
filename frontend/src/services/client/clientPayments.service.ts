import { http } from "@/lib/axiosInstance";
import type { AddToLibraryRequest, CreatePaymentIntentRequest, CreatePaymentIntentResponse } from "@/types/client/payments";
import type { AxiosRequestConfig } from "axios";

export class ClientPaymentsService {
  static async createPaymentIntent(data: CreatePaymentIntentRequest, config?: AxiosRequestConfig) {
    const response = await http.post<CreatePaymentIntentResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/payments/intent`,
      data,
      config
    );
    return response.data;
  }

  static async addToLibrary(data: AddToLibraryRequest, config?: AxiosRequestConfig) {
    const response = await http.post<void>(
      `${import.meta.env.VITE_D_SERVICE_URL}/payments/add-to-library`,
      data,
      config
    );
    return response.data;
  }
}
