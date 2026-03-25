import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { ClientPaymentMethodsService } from "@/services/client/clientPaymentMethods.service"
import type { GetPaymentMethodsRequest, PaymentMethodResponse } from "@/types/client/paymentMethods"
import type { LocalErrorResponse } from "@/types/error"
import type { AxiosError } from "axios"
import { useQuery } from "react-query"
import { useNavigate } from "react-router-dom"

export const GET_PAYMENT_METHODS_QUERY_KEY = "get_payment_methods"

export const getGetPaymentMethodsQueryKey = () => {
  return [GET_PAYMENT_METHODS_QUERY_KEY]
}

export const useGetPaymentMethodsQuery = (data: GetPaymentMethodsRequest, enabled?: boolean) => {
	const navigate = useNavigate()

  return useQuery<PaymentMethodResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getGetPaymentMethodsQueryKey(),
    queryFn: ({ signal }) => ClientPaymentMethodsService.getPaymentMethods(data, { signal }),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
    enabled: enabled
  })
}