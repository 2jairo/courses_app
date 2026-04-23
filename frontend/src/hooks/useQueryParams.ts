import { useMemo, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

interface UseQueryParamsProps<T extends object> {
  defaultValues: T
  parseParams: (params: URLSearchParams) => Partial<T>
  setParams: (values: T) => URLSearchParams 
}

export const useQueryParams = <T extends object>({ defaultValues, parseParams, setParams }: UseQueryParamsProps<T>) => {
  const location = useLocation()
  const navigate = useNavigate()

  const queryParams = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const parsed = parseParams(params)
    return {
      ...defaultValues,
      ...parsed
    } as T
  }, [location.search, defaultValues, parseParams])

  const setQueryParams = useCallback((valuesOrUpdater: T | ((prev: T) => T)) => {
    const newValues = typeof valuesOrUpdater === "function" 
      ? (valuesOrUpdater as (prev: T) => T)(queryParams) 
      : valuesOrUpdater
    
    const searchParams = setParams(newValues)
    const newSearch = searchParams.toString()
    navigate(`?${newSearch}`, { replace: true })
  }, [queryParams, navigate, setParams])

  return {
    queryParams,
    setQueryParams,
    setParamsInner: setParams,
  }
}