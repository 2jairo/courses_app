import React, { useCallback, useEffect, useState } from "react"
import { useDashboardCoursesQuery } from "@/queries/dashboard/courses/useCoursesQuery"
import type { CourseResponse, GetDashboardCoursesRequest } from "@/types/courses"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination as Pager,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"
import { useLocation, useNavigate } from "react-router-dom"
import { DebouncedInput } from "@/components/shared/debouncedInput/debouncedInput"
import { CreateCourseButton } from "@/components/shared/dashboard/courses/createCourseButton"
import { CoursePropsRow } from "@/components/shared/dashboard/courses/coursePropsRow"

const DEFAULT_PAGE_SIZE = 10
const queryParamsInitialState: GetDashboardCoursesRequest = {
  page: 1,
  size: DEFAULT_PAGE_SIZE,
  q: null
}

export default function CourseListDasbhoard() {
  const location = useLocation()
  const navigate = useNavigate()

  const [queryParams, setQueryParams] = useState<GetDashboardCoursesRequest>(() => {
    const params = new URLSearchParams(location.search)
    const page = parseInt(params.get("page") || '')
    const q = params.get("q")
    
    return {
      ...queryParamsInitialState,
      page: isNaN(page) ? queryParamsInitialState.page : page,
      q: q || queryParamsInitialState.q
    }
  })

  useEffect(() => {
    const searchParams = new URLSearchParams()
    searchParams.set("page", queryParams.page.toString())
    searchParams.set("q", queryParams.q || '')
    
    const newSearch = searchParams.toString()  
    navigate(`?${newSearch}`, { replace: true })
  }, [queryParams, navigate])

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

        <CreateCourseButton />
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
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Visibilidad</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Lecciones</TableHead>
                    <TableHead>Actualizado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <CoursePropsRow course={course} key={course.id}/>
                  ))}
                </TableBody>
              </Table>
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
