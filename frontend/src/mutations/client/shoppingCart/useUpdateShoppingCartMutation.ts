import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"

import { ClientShoppingCartService } from "@/services/client/clientShoppingCart.service"
import type { UpdateShoppingCartRequest } from "@/types/client/shoppingCart"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { GET_SHOPPING_CART_QUERY_KEY } from "@/queries/client/shoppingCart/useGetShoppingCartQuery"

export const useUpdateShoppingCartMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, UpdateShoppingCartRequest>({
    mutationFn: (data) => ClientShoppingCartService.updateShoppingCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries(GET_SHOPPING_CART_QUERY_KEY)
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}