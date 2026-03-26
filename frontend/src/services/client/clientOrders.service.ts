import { http } from "@/lib/axiosInstance";
import { objectToParams } from "@/lib/objectToParams";
import type { GetOrdersRequest, OrderResponse } from "@/types/client/orders";
import type { Pagination } from "@/types/pagination";
import type { AxiosRequestConfig } from "axios";

export class ClientOrdersService {
  static async getOrders(data: GetOrdersRequest & Pagination, config?: AxiosRequestConfig) {
    const queryParams = objectToParams(data).toString()

    const response = await http.get<OrderResponse[]>(
      `${import.meta.env.VITE_D_SERVICE_URL}/orders?${queryParams}`,
      config
    );
    return response.data;
  }
}
