import { Search } from "@/components/shared/search/search"
import { useSearchCoursesQuery } from "@/queries/client/search/useSearchCoursesQuery"
import { SearchContext } from "@/context/search/createSearchProvider"
import { useContext, useEffect } from "react"
import { setDocumentTitle } from "@/lib/documentTitle"

export default function SearchPage() {
  const { filters } = useContext(SearchContext)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { originalQ, ...restOfFilters } = filters
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useSearchCoursesQuery(restOfFilters)

  useEffect(() => {
    setDocumentTitle(`Buscar cursos: ${filters.q}`)
  }, [filters])

  return(
    <Search 
      queryParams={filters} 
      data={data}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
    />
  )
}