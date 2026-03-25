import { useQuery } from "react-query"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"

import { ClientShoppingCartService } from "@/services/client/clientShoppingCart.service"
import type { GetShoppingCartRequest, ShoppingCartResponse } from "@/types/client/shoppingCart"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const GET_SHOPPING_CART_QUERY_KEY = "get_shopping_cart"

interface GetShoppingCartRequestWrapper {
	username?: string
	payload: GetShoppingCartRequest
}

export const getShoppingCartQueryKey = (data: GetShoppingCartRequestWrapper) => {
	return [GET_SHOPPING_CART_QUERY_KEY, data] as const
}

export const useGetShoppingCartQuery = (data: GetShoppingCartRequestWrapper, enabled?: boolean) => {
	const navigate = useNavigate()

	const query = useQuery<ShoppingCartResponse, AxiosError<LocalErrorResponse>>({
		queryKey: getShoppingCartQueryKey(data),
		queryFn: ({ signal }) => ClientShoppingCartService.getShoppingCart(data.payload, { signal }),
		onError: (e) => queryOrMutationDefaultOnError(e, navigate),
		refetchOnMount: false,
		staleTime: Infinity,
		enabled
	})

	if (enabled === false) {
		return {
			...query,
			data: undefined
		}
	}

	return query
}