import { http } from "@/lib/axiosInstance";
import type { AxiosRequestConfig } from "axios";
import type { 
  GetShoppingCartRequest, 
  ClearShoppingCartRequest, 
  UpdateShoppingCartRequest, 
  ShoppingCartResponse 
} from "@/types/client/shoppingCart";

export class ClientShoppingCartService {
  static async getShoppingCart(_data: GetShoppingCartRequest, config?: AxiosRequestConfig) {
    const response = await http.get<ShoppingCartResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/shopping-cart`,
      config
    )
    return response.data
  }

  static async clearShoppingCart(_data: ClearShoppingCartRequest, config?: AxiosRequestConfig) {
    const response = await http.delete<ShoppingCartResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/shopping-cart`,
      config
    )
    return response.data
  }

  static async updateShoppingCart(data: UpdateShoppingCartRequest, config?: AxiosRequestConfig) {
    const response = await http.put<void>(
      `${import.meta.env.VITE_D_SERVICE_URL}/shopping-cart`,
      data,
      config
    )
    return response.data
  }
}