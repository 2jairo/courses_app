import { Calendar, Star, Globe, Clock, PlayCircle, Lock, Paperclip, ChevronDown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { WatchCourseResponse } from "@/types/client/courses"
import { calculateProgress, formatDuration, formatFileSize, formatViews } from "@/lib/format"
import { CourseVisibilityBadge } from "@/components/shared/coursesUtils/courseVisibility"
import { CourseRoleBadge } from "@/components/shared/coursesUtils/courseRole"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileKindIcon } from "../filesUtils/fileKindIcon"

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

  const allAssets = course.sections.map(
    (section) => {
      return section.lectures.map((lecture) => lecture.assets).flat()
    }
  ).flat()
  .filter(
    (asset, index, self) => {
    return self.findIndex(a => a.fileId === asset.fileId) === index
  })


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
              {course.publicLecturesAmmount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4" />
                  <span>{course.publicLecturesAmmount} públicas</span>
                </div>
              )}
              {course.lectureAssets > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
                      <Paperclip className="h-4 w-4" />
                      <span>{course.lectureAssets} recursos</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 gap-0" align="start">
                    <div className="p-3 border-b border-border">
                      <h4 className="font-medium text-sm text-foreground">Recursos del curso</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{allAssets.length} recursos descargables</p>
                    </div>

                    <ScrollArea className="h-75">
                      <div className="max-w-80 p-2 space-y-1">
                        {allAssets.map((asset) => (
                          <div
                            key={asset.fileId}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                          >
                            <FileKindIcon fileKind={asset.kind} className="w-5 h-5 shrink-0"/>

                            <div className="flex-1 min-w-0 overflow-hidden">
                              <p className="text-sm font-medium text-foreground overflow-hidden text-ellipsis whitespace-nowrap">{asset.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(asset.size)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              )}
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
