import { createContext, useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import type { SearchCoursesRequest } from "@/types/client/search"
import { useQueryParamsSearch } from "@/context/search/useQueryParamsSearch"

export const useCreateSearchProvider = () => {
  const { queryParams, setParamsInner } = useQueryParamsSearch()
  const [filters, setFilters] = useState<SearchCoursesRequest & { originalQ?: string }>(queryParams)
  
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setFilters(queryParams)
  }, [location])

  const updateUrlFilters = (newFilters: SearchCoursesRequest, replace = false) => {
    const params = setParamsInner(newFilters).toString()
    navigate(`/search?${params}`, { replace })
    setFilters(newFilters)
  }

  const silentlyUpdateUrl = (newFilters: SearchCoursesRequest) => {
    const params = setParamsInner(newFilters).toString()
    window.history.replaceState(null, "", `${location.pathname}?${params}`)
    setFilters( newFilters)
  }

  return {
    filters,
    setFilters,
    updateUrlFilters,
    silentlyUpdateUrl
  }
}

export const SearchContext = createContext<ReturnType<typeof useCreateSearchProvider>>(
  {} as ReturnType<typeof useCreateSearchProvider>
)
