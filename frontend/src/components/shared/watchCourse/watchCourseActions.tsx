import { Clock, Heart, Share2, Trophy, Infinity as InfinityIcon, Download, PlayCircle, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import type { WatchCourseResponse } from "@/types/client/courses"
import { Link } from "react-router-dom"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useResetCourseProgressMutation } from "@/mutations/client/courses/useResetCourseProgressMutation"
import { toast } from "sonner"

interface WatchCourseActionsProps {
  course: WatchCourseResponse
}

export const WatchCourseActions = ({ course }: WatchCourseActionsProps) => { 
  const resetCourseProgressMutation = useResetCourseProgressMutation()

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  const handleResetProgress = () => {
    resetCourseProgressMutation.mutate({
      courseSlug: course.slug,
      payload: {
        courseId: course.id
      }
    }, {
      onSuccess: () => {
        toast.success('Progreso reiniciado correctamente')
      }
    })
  }
  
  const totalLectures = course.sections
    .reduce((acc, section) => acc + section.lectures.length, 0)

  const handleAddToFav = () => {
    //TODO
  }

  return (
    <div>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={totalLectures === 0 ? '#' : `/play/${course.slug}`} className="flex-1 flex items-center gap-3">
                  <Button className="gap-2 flex-1">
                    <PlayCircle className="h-5 w-5" />

                    {course.completedLectures === totalLectures && totalLectures > 0
                      ? "Curso completado"
                      : course.completedLectures > 0 ? "Continuar viendo" : "Comenzar curso"
                    }
                  </Button>
                </Link>
              </TooltipTrigger>

              {totalLectures === 0 && (
                <TooltipContent className="z-999">
                  <div className="flex items-center gap-2">
                    Sin contenido
                  </div>
                </TooltipContent>
              )}
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={handleResetProgress}>
                  <Undo2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="z-999">
                <div className="flex items-center gap-2">
                  Reiniciar progreso
                </div>
              </TooltipContent>
            </Tooltip>

          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Este curso incluye:</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Acceso de por vida</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Download className="h-4 w-4 shrink-0" />
                <span>Recursos descargables</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4 shrink-0" />
                <span>Certificado de finalización</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <InfinityIcon className="h-4 w-4 shrink-0" />
                <span>Acceso móvil y TV</span>
              </li>
            </ul>
          </div>

          <Separator />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-2"
              onClick={handleAddToFav}
            >
              <Heart className="h-4 w-4" />
              Favoritos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-2"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              Compartir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}