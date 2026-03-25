import { useMutation, useQueryClient } from "react-query"
import { ClientPaymentMethodsService } from "@/services/client/clientPaymentMethods.service"
import type { RemovePaymentMethodRequest } from "@/types/client/paymentMethods"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { useNavigate } from "react-router-dom"
import type { AxiosError } from "axios"
import type { LocalErrorResponse } from "@/types/error"
import { GET_PAYMENT_METHODS_QUERY_KEY } from "@/queries/client/paymentMethods/useGetPaymentMethodsQuery"

export const useRemovePaymentMethodMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError<LocalErrorResponse>, RemovePaymentMethodRequest>({
    mutationFn: (data: RemovePaymentMethodRequest) => ClientPaymentMethodsService.removePaymentMethod(data),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
    onSuccess: () => {
      queryClient.invalidateQueries([GET_PAYMENT_METHODS_QUERY_KEY])
    },
  })
}
