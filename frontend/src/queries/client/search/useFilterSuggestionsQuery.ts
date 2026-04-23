import { useNavigate } from "react-router-dom"
import { useQuery } from "react-query"
import type { AxiosError } from "axios"

import { ClientSearchService } from "@/services/client/clientSearch.service"
import type { GetFilterSuggestionsRequest, GetFilterSuggestionsResponse } from "@/types/client/search"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const FILTER_SUGGESTIONS_QUERY_KEY = "filter_suggestions"

export const getFilterSuggestionsQueryKey = (data: GetFilterSuggestionsRequest) => {
  return [FILTER_SUGGESTIONS_QUERY_KEY, data] as const
}

export const useFilterSuggestionsQuery = (data: GetFilterSuggestionsRequest, enabled?: boolean) => {
  const navigate = useNavigate()
  
  return useQuery<GetFilterSuggestionsResponse[], AxiosError<LocalErrorResponse>>({
    queryKey: getFilterSuggestionsQueryKey(data),
    queryFn: ({ signal }) => ClientSearchService.getFilterSuggestions(data, { signal }),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
    enabled: !!data.field && data.field.trim().length > 0 && enabled
  })
}
