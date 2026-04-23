import type { SearchCoursesRequest, SearchCoursesResponse } from "@/types/client/search";
import type { InfiniteData } from "react-query";
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { CourseCard } from "../course/courseCard";
import { formatViews } from "@/lib/format";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export interface SearchParams {
  queryParams: SearchCoursesRequest & { originalQ?: string }
  data?: InfiniteData<SearchCoursesResponse>
  fetchNextPage: () => void
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  isLoading: boolean
}

export const Search = ({ queryParams, data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading }: SearchParams) => {
  const observerTarget = useInfiniteScroll({ fetchNextPage, isFetchingNextPage, hasNextPage })
  const [searchStartTime, setSearchStartTime] = useState<number>(Date.now())
  const [timeSpentMs, setTimeSpentMs] = useState<number>(0)

  useEffect(() => {
    if (isLoading) {
      setSearchStartTime(Date.now())
    } else {
      setTimeSpentMs(Date.now() - searchStartTime)
    }
  }, [isLoading])

  const courses = data?.pages.flatMap((page) => page.courses) ?? []
  const totalFound = formatViews(data?.pages[0]?.found ?? 0)

  return (
    <div className="w-full max-w-350 mx-auto px-4 py-8">
      {/* Search Metric Header */}
      {!isLoading && !isFetchingNextPage && data && (
        <div className="text-sm text-muted-foreground pb-2">
          Se encontraron {totalFound} resultados {queryParams.q && <span>para <span className="font-medium text-foreground">"{queryParams.q || queryParams.originalQ}"</span></span>} en {(timeSpentMs / 1000).toFixed(2)} segundos.
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-semibold">No se encontraron cursos</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Intenta con otros términos de búsqueda o filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} viewSource="Search" scrollToTop />
          ))}
        </div>
      )}

      {/* Intersection observer target for infinite scroll */}
      <div ref={observerTarget} className="h-2 mt-8" />

      {/* Loading indicator for next page */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
 