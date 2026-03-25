import { ClientPaymentMethodsService } from "@/services/client/clientPaymentMethods.service"
import type { FinishSetupIntentRequest, PaymentMethodResponse } from "@/types/client/paymentMethods"
import { getGetPaymentMethodsQueryKey } from "@/queries/client/paymentMethods/useGetPaymentMethodsQuery"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "react-query"
import type { AxiosError } from "axios"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const useFinishSetupIntentMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<PaymentMethodResponse, AxiosError<LocalErrorResponse>, FinishSetupIntentRequest>({
    mutationFn: (data) => ClientPaymentMethodsService.finishSetupIntent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetPaymentMethodsQueryKey() })
    },
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}