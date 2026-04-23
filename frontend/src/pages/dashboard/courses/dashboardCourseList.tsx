import React, { useCallback, useEffect } from "react"
import { useDashboardCoursesQuery } from "@/queries/dashboard/courses/useCoursesQuery"
import type { CourseResponse, GetDashboardCoursesRequest } from "@/types/dashboard/courses"

import {
  Pagination as Pager,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"
import { DebouncedInput } from "@/components/shared/debouncedInput/debouncedInput"
import { CoursePropsCard } from "@/components/shared/dashboard/courses/coursePropsCard"
import { CreateCourseModal } from "@/components/shared/dashboard/courses/courseActionsCreateCourse"
import { useQueryParams } from "@/hooks/useQueryParams"
import { setDocumentTitle } from "@/lib/documentTitle"

const DEFAULT_PAGE_SIZE = 10
const queryParamsInitialState: GetDashboardCoursesRequest = {
  page: 1,
  size: DEFAULT_PAGE_SIZE,
  q: null
}

export default function DashboardCourseListPage() {
  useEffect(() => {
    setDocumentTitle("Mis cursos", true)
  }, [])

  const { queryParams, setQueryParams } = useQueryParams<GetDashboardCoursesRequest>({
    defaultValues: queryParamsInitialState,
    parseParams: (params) => {
      const page = parseInt(params.get("page") || '')
      const q = params.get("q")
      
      return {
        page: isNaN(page) ? queryParamsInitialState.page : page,
        q: q || queryParamsInitialState.q
      }
    },
    setParams: (params) => {
      const searchParams = new URLSearchParams()
      searchParams.set("page", params.page.toString())
      searchParams.set("q", params.q || '')
      return searchParams
    }
  })

  const coursesQuery = useDashboardCoursesQuery(queryParams)
  const courses = (coursesQuery.data ?? []) as CourseResponse[]

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault()

    if(queryParams.page === 1) return
    setQueryParams((prev) => ({
      ...prev,
      page: Math.max(1, prev.page - 1),
    }))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()

    if (courses.length < queryParams.size) return
    setQueryParams((prev) => ({
      ...prev,
      page: prev.page + 1,
    }))
  }

  const handleQuery = useCallback((newValue: string) => {
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      q: newValue || null,
    }))
  }, [setQueryParams])


  return (
    <section className="flex flex-1 flex-col gap-4 p-4 w-full m-auto max-w-350">
      <header className="flex flex-row items-center justify-between gap-4">
        <DebouncedInput 
          value={queryParams.q ?? ""}
          onChange={handleQuery}
          placeholder="Buscar cursos por título..."
        />

        <CreateCourseModal />
      </header>

      <div className="flex flex-1 flex-col gap-4 pt-2">
        {coursesQuery.isLoading && (
          <div className="flex flex-1 items-center justify-center py-10">
            <Spinner />
          </div>
        )}
        
        {courses.length === 0 && !coursesQuery.isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <p>No hay cursos para mostrar.</p>
            <p>Comienza creando tu primer curso.</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {courses.map((course) => (
                <CoursePropsCard course={course} key={course.id} />
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>
                Página {queryParams.page}{" "}
                {coursesQuery.isFetching && <span className="ml-1">(actualizando...)</span>}
              </span>

              <Pager className="w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={handlePrevious}
                      aria-disabled={queryParams.page === 1}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={handleNext}
                      aria-disabled={courses.length < queryParams.size}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pager>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
