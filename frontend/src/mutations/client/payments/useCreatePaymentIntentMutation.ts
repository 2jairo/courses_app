import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { GET_SHOPPING_CART_QUERY_KEY } from "@/queries/client/shoppingCart/useGetShoppingCartQuery"
import { ClientPaymentsService } from "@/services/client/clientPayments.service"
import type { CreatePaymentIntentRequest, CreatePaymentIntentResponse } from "@/types/client/payments"
import type { LocalErrorResponse } from "@/types/error"
import type { AxiosError } from "axios"
import { useMutation, useQueryClient } from "react-query"
import { useNavigate } from "react-router-dom"

export const useCreatePaymentIntentMutation = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation<CreatePaymentIntentResponse, AxiosError<LocalErrorResponse>, CreatePaymentIntentRequest>({
    mutationFn: (data) => ClientPaymentsService.createPaymentIntent(data),
    onSuccess: () => {
      queryClient.invalidateQueries(GET_SHOPPING_CART_QUERY_KEY)
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
