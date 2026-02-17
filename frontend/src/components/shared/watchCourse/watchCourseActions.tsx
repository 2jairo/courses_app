import { Clock, Heart, Share2, Trophy, Infinity as InfinityIcon, Download, PlayCircle, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import type { WatchCourseResponse } from "@/types/client/courses"
import { Link } from "react-router-dom"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useResetCourseProgressMutation } from "@/mutations/client/courses/useResetCourseProgressMutation"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

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
    if(totalLectures === 0) {
      return
    } 

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

            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button size="icon">
                      <Undo2 />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent className="z-999">
                  <div className="flex items-center gap-2">
                    Reiniciar progreso
                  </div>
                </TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Reiniciar progreso?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción reiniciará tu progreso en el curso. ¿Estás seguro?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetProgress}>
                    Reiniciar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Este curso incluye:</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Acceso de por vida</span>
              </li>
              {course.lectureAssets > 0 && (
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Download className="h-4 w-4 shrink-0" />
                  <span>{course.lectureAssets} recursos descargables</span>
                </li>
              )}
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