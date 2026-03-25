import { http } from "@/lib/axiosInstance";
import type { 
  CreateSetupIntentRequest, 
  CreateSetupIntentResponse, 
  FinishSetupIntentRequest, 
  GetPaymentMethodsRequest, 
  PaymentMethodResponse,
  UpdatePaymentMethodRequest,
  RemovePaymentMethodRequest
} from "@/types/client/paymentMethods";
import type { AxiosRequestConfig } from "axios";

export class ClientPaymentMethodsService {
  static async createSetupIntent(_data: CreateSetupIntentRequest, config?: AxiosRequestConfig) {
    const response = await http.post<CreateSetupIntentResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/payment-methods/setup-intent`,
      {},
      config
    )
    return response.data
  }

  static async finishSetupIntent(data: FinishSetupIntentRequest, config?: AxiosRequestConfig) {
    const response = await http.post<PaymentMethodResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/payment-methods/setup-intent/finish`,
      data,
      config
    )
    return response.data
  }

  static async getPaymentMethods(_data: GetPaymentMethodsRequest, config?: AxiosRequestConfig) {
    const response = await http.get<PaymentMethodResponse[]>(
      `${import.meta.env.VITE_D_SERVICE_URL}/payment-methods`,
      config
    )
    return response.data
  }

  static async updatePaymentMethod(data: UpdatePaymentMethodRequest, config?: AxiosRequestConfig) {
    const { paymentMethodId, ...body } = data
    const response = await http.put<PaymentMethodResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/payment-methods/${paymentMethodId}`,
      body,
      config
    )
    return response.data
  }

  static async removePaymentMethod(data: RemovePaymentMethodRequest, config?: AxiosRequestConfig) {
    const response = await http.delete<void>(
      `${import.meta.env.VITE_D_SERVICE_URL}/payment-methods/${data.paymentMethodId}`,
      config
    )
    return response.data
  }
}
