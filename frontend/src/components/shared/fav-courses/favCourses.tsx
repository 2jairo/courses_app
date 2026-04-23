import { CourseCard } from "@/components/shared/course/courseCard"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useToggleFavoriteCourseMutation } from "@/mutations/client/courses/useToggleFavoriteCourseMutation"
import { useFavoriteCoursesQuery } from "@/queries/client/favoriteCourses/useFavoriteCoursesQuery"
import { Heart } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"

export function FavCourses() {
  const {
    data: favoriteCourses,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFavoriteCoursesQuery()
  const toggleFavoriteCourseMutation = useToggleFavoriteCourseMutation()
  const courses = favoriteCourses?.pages.flat() ?? []
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null)
  const observerTarget = useInfiniteScroll({ fetchNextPage, hasNextPage, isFetchingNextPage })

  const handleUnfavorite = (courseId: string, courseSlug: string) => {
    const parsedCourseId = Number(courseId)
    if (!Number.isInteger(parsedCourseId)) {
      return
    }

    setPendingCourseId(courseId)
    toggleFavoriteCourseMutation.mutate(
      {
        payload: {
          courseId: parsedCourseId,
          newValue: false,
        },
        courseSlug,
      },
      {
        onSettled: () => {
          setPendingCourseId(null)
        },
      }
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <div>
          <h2 className="text-lg font-medium">Cursos favoritos</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona los cursos guardados como favoritos. Actualmente tienes {courses.length} curso{courses.length === 1 ? "" : "s"}.
          </p>
        </div>

        <Button asChild>
          <Link to="/search">Explorar cursos</Link>
        </Button>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="size-8" />
          </div>
        ) : courses.length === 0 ? (
          <Empty className="border py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Heart className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Aun no tienes favoritos</EmptyTitle>
              <EmptyDescription>
                Marca cursos con el icono de corazon para verlos aqui rapidamente.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link to="/search">Buscar cursos</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  viewSource="Direct"
                  scrollToTop
                  isFavorite
                  isFavoriteLoading={pendingCourseId === course.id}
                  onToggleFavorite={() => handleUnfavorite(course.id, course.slug)}
                />
              ))}
            </div>

            <div ref={observerTarget} className="h-2" />

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Spinner className="size-6" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}