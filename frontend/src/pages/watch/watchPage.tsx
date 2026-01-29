import { useParams } from "react-router-dom"
import { useWatchCourseQuery } from "@/queries/client/courses/useWatchCourseQuery"
import type { WatchCourseResponse } from "@/types/client/courses"
import { BookOpen, Calendar, CheckCircle2, Clock, Eye, Lock, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatDuration } from "@/lib/format"
import { Badge } from "@/components/ui/badge"


export default function WatchPage() {
  const { courseSlug } = useParams()
  const coursesQuery = useWatchCourseQuery({ courseSlug: courseSlug! })

  return (
    <>
      {coursesQuery.data && (
        <WatchCoursePage course={coursesQuery.data}/>
      )}
    </>
  )
}

function calculateProgress(completed: number, total: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}


function CourseStats({ course }: { course: WatchCourseResponse }) {
  const totalDuration = course.sections.reduce((total, section) => {
    return total + section.lectures.reduce((secTotal, lecture) => {
      return secTotal + lecture.estimatedDurationSecs;
    }, 0);
  }, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Progreso</p>
              <p className="text-2xl font-bold">{calculateProgress(course.completedLectures, course.lecturesAmmount)}%</p>
            </div>
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <Progress 
            value={calculateProgress(course.completedLectures, course.lecturesAmmount)} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lecciones</p>
              <p className="text-2xl font-bold">{course.lecturesAmmount}</p>
            </div>
            <PlayCircle className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {course.completedLectures} completadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Duración</p>
              <p className="text-2xl font-bold">{formatDuration(totalDuration)}</p>
            </div>
            <Clock className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Última visita</p>
              <p className="text-lg font-bold">
                {course.lastSeenTime 
                  ? new Date(course.lastSeenTime).toLocaleDateString('es-ES')
                  : 'Nunca'
                }
              </p>
            </div>
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


function WatchCoursePage({ course }: { course: WatchCourseResponse }) {
  // Encontrar la primera lección no vista para continuar
  const nextLecture = course.sections
    .flatMap(section => section.lectures)
    .find(lecture => !lecture.seen);

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {/* Header del curso */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Poster del curso */}
          {course.poster && (
            <div className="md:w-1/3">
              <div className="relative aspect-video md:aspect-square rounded-lg overflow-hidden">
                <img
                  src={course.poster}
                  alt={course.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </div>
          )}

          {/* Información del curso */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={course.visibility === "Public" ? "default" : "secondary"}>
                {course.visibility === "Public" ? "Público" : "Privado"}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Eye className="h-3 w-3" />
                {course.lecturesAmmount} lecciones
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {course.title}
            </h1>

            <p className="text-lg text-muted-foreground mb-6">
              {course.description}
            </p>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-3 mb-6">
              {nextLecture ? (
                <Button size="lg" className="gap-2">
                  <PlayCircle className="h-5 w-5" />
                  {nextLecture.seen ? "Continuar viendo" : "Comenzar curso"}
                </Button>
              ) : (
                <Button size="lg" className="gap-2" disabled>
                  <CheckCircle2 className="h-5 w-5" />
                  Curso completado
                </Button>
              )}
              
              <Button variant="outline" size="lg">
                Añadir a favoritos
              </Button>
            </div>

            {/* Información adicional */}
            <div className="text-sm text-muted-foreground">
              <p>
                Actualizado el {new Date(course.updatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Estadísticas */}
      <CourseStats course={course} />

      {/* Contenido del curso */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Contenido del curso</h2>
        
        <div className="space-y-4">
          {course.sections.map((section) => (
            <Card key={section.slug}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{section.title}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {section.lectures.length} lecciones
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.lectures.map((lecture) => (
                    <div
                      key={lecture.slug}
                      className={`p-4 rounded-lg border ${
                        lecture.seen
                          ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                          : 'bg-card'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded ${
                            lecture.seen 
                              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                              : 'bg-muted'
                          }`}>
                            {lecture.seen ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : lecture.visibility === "Private" ? (
                              <Lock className="h-5 w-5" />
                            ) : (
                              <PlayCircle className="h-5 w-5" />
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{lecture.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {lecture.kind}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {lecture.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(lecture.estimatedDurationSecs)}
                              </span>
                              {lecture.seen && (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Completado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm">
                          {lecture.seen ? "Volver a ver" : "Ver lección"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Panel lateral para móvil/tablet (opcional) */}
      <div className="md:hidden">
        <Card>
          <CardHeader>
            <CardTitle>Tu progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progreso total</span>
                  <span>{calculateProgress(course.completedLectures, course.lecturesAmmount)}%</span>
                </div>
                <Progress value={calculateProgress(course.completedLectures, course.lecturesAmmount)} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{course.completedLectures}</p>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{course.lecturesAmmount - course.completedLectures}</p>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}