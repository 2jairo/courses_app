import { useNavigate } from "react-router-dom"
import { useInfiniteQuery } from "react-query"
import type { AxiosError } from "axios"

import { ClientOrdersService } from "@/services/client/clientOrders.service"
import type { GetOrdersRequest, OrderResponse } from "@/types/client/orders"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const ORDERS_QUERY_KEY = "client_orders"
export const ORDERS_PAGE_SIZE = 15

export const getOrdersQueryKey = (q: GetOrdersRequest) => {
  return [ORDERS_QUERY_KEY, q] as const
}

export const useOrdersQuery = (q: GetOrdersRequest = {}) => {
  const navigate = useNavigate()
  
  return useInfiniteQuery<OrderResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getOrdersQueryKey(q),
    queryFn: ({ pageParam, signal }) => ClientOrdersService.getOrders({
      ...q,
      page: pageParam?.page || 1,
      size: pageParam?.size || ORDERS_PAGE_SIZE
    }, { signal }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < ORDERS_PAGE_SIZE ? undefined : {
        page: allPages.length + 1,
        size: ORDERS_PAGE_SIZE
      }
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate, '/'),
  })
}
