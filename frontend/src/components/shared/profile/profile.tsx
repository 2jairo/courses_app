import { Link } from "react-router-dom"
import { BookOpen, Bell, GraduationCap } from "lucide-react"

import { CourseCard } from "@/components/shared/course/courseCard"
import { UserAvatar } from "@/components/shared/userAvatar/userAvatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useProfileCoursesQuery } from "@/queries/client/profile/useProfileCoursesQuery"
import { useProfileInfoQuery } from "@/queries/client/profile/useProfileInfoQuery"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"

export function Profile() {
  const profileInfoQuery = useProfileInfoQuery()
  const profileCoursesQuery = useProfileCoursesQuery()

  const courses = profileCoursesQuery.data?.pages.flat() ?? []
  const observerTarget = useInfiniteScroll({
    fetchNextPage: profileCoursesQuery.fetchNextPage,
    hasNextPage: profileCoursesQuery.hasNextPage,
    isFetchingNextPage: profileCoursesQuery.isFetchingNextPage,
  })

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Informacion de tu cuenta y cursos que has creado.</CardDescription>
        </CardHeader>
        <CardContent>
          {profileInfoQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-8" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar
                  avatar={profileInfoQuery.data?.avatar}
                  username={profileInfoQuery.data?.username}
                  className="h-14 w-14"
                />
                <div>
                  <p className="text-lg font-semibold">{profileInfoQuery.data?.username}</p>
                  <p className="text-sm text-muted-foreground">{profileInfoQuery.data?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Bell className="size-4" />
                  <span>{profileInfoQuery.data?.unread_notifications ?? 0} notificación/es</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4" />
                  <span>{courses.length} cursos</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Mis cursos</h2>
            <p className="text-sm text-muted-foreground">Cursos que has creado como autor.</p>
          </div>

          <Button asChild variant="outline">
            <Link to="/dashboard/courses">Ir al dashboard</Link>
          </Button>
        </div>

        {profileCoursesQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="size-8" />
          </div>
        ) : courses.length === 0 ? (
          <Empty className="border py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <GraduationCap className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Aun no has creado cursos</EmptyTitle>
              <EmptyDescription>
                Crea tu primer curso desde el dashboard para verlo aqui.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link to="/dashboard/courses">Crear curso</Link>
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

            {profileCoursesQuery.isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Spinner className="size-6" />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
