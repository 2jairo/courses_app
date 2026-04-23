import { Link } from "react-router-dom"
import { GraduationCap } from "lucide-react"

import { CourseCard } from "@/components/shared/course/courseCard"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { useLibraryCoursesQuery } from "@/queries/client/library/useLibraryCoursesQuery"

export function Library() {
  const libraryCoursesQuery = useLibraryCoursesQuery()

  const courses = libraryCoursesQuery.data?.pages.flat() ?? []
  const observerTarget = useInfiniteScroll({
    fetchNextPage: libraryCoursesQuery.fetchNextPage,
    hasNextPage: libraryCoursesQuery.hasNextPage,
    isFetchingNextPage: libraryCoursesQuery.isFetchingNextPage,
  })

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Mi biblioteca</h2>
          <p className="text-sm text-muted-foreground">Cursos que has comprado o canjeado.</p>
        </div>

        <Button asChild variant="outline">
          <Link to="/search">Explorar mas cursos</Link>
        </Button>
      </div>

      {libraryCoursesQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-8" />
        </div>
      ) : courses.length === 0 ? (
        <Empty className="border py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GraduationCap className="size-5" />
            </EmptyMedia>
            <EmptyTitle>Tu biblioteca esta vacia</EmptyTitle>
            <EmptyDescription>
              Cuando compres o canjees un curso aparecera aqui automaticamente.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/search">Descubrir cursos</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} viewSource="Direct" scrollToTop />
            ))}
          </div>

          <div ref={observerTarget} className="h-2" />

          {libraryCoursesQuery.isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Spinner className="size-6" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
