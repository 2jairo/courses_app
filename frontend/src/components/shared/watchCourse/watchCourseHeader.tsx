import { Calendar, Star, Globe, Clock, PlayCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { WatchCourseResponse } from "@/types/client/courses"
import { calculateProgress, formatDuration, formatViews } from "@/lib/format"
import { CourseVisibilityBadge } from "@/components/shared/coursesUtils/courseVisibility"
import { CourseRoleBadge } from "@/components/shared/coursesUtils/courseRole"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

interface CourseHeroStatsProps {
  course: WatchCourseResponse
  id: string
}

export function WatchCourseHeader({ course, id }: CourseHeroStatsProps) {
  const totalDuration = course.sections.reduce(
    (acc, section) => {
      return acc + section.lectures.reduce((l, lecture) => l + lecture.estimatedDurationSecs, 0)
    },
    0
  )

  // Mock rating for demo purposes - in real app this would come from API
  const rating = 4.7
  const peopleRated = formatViews(4000)
  const studentsCount = formatViews(6558)

  return (
    <section className="border-b border-border bg-card" id={id}>
      <div className="mx-auto max-w-350 px-4 py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <CourseVisibilityBadge visibility={course.visibility} variant="outline"/>
              {course.role && (
                <>
                  <CourseRoleBadge role={course.role} variant="outline"/>

                  <Link to={`/dashboard/courses/${course.id}`}>
                    <Button size="xs" variant="link">
                      Gestionar
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-balance lg:text-4xl text-foreground">
              {course.title}
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {course.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(rating)
                          ? "fill-foreground text-foreground"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  ({peopleRated})
                </span>
              </div>
              <span className="text-muted-foreground">
                {studentsCount} estudiantes
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Actualizado {new Date(course.updatedAt).toLocaleDateString('es-ES', {
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                <span>Español</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(totalDuration, true)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4" />
                <span>{course.lecturesAmmount} lecciones</span>
              </div>
            </div>

            {/* Progress Info */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Tu progreso</span>
                <span className="text-sm font-medium text-foreground">
                  {calculateProgress(course.completedLectures, course.lecturesAmmount)}%
                </span>
              </div>
              <Progress 
                value={calculateProgress(course.completedLectures, course.lecturesAmmount)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {course.completedLectures} de {course.lecturesAmmount} lecciones completadas
              </p>
            </div>
          </div>

          {/* Video Preview Card */}
          <div className="order-1 lg:order-2">
            <div className="sticky top-6">
              {course.poster && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted mb-6">
                  <img
                    src={course.poster}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
