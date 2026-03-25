import { Clock, Heart, Share2, Trophy, Infinity as InfinityIcon, Download, PlayCircle, Undo2, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import type { WatchCourseResponse } from "@/types/client/courses"
import { Link } from "react-router-dom"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useResetCourseProgressMutation } from "@/mutations/client/courses/useResetCourseProgressMutation"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToggleFavoriteCourseMutation } from "@/mutations/client/courses/useToggleFavoriteCourseMutation"
import { cn } from "@/lib/utils"
import type { UserAuthServiceUserProfileResponse } from "@/types/client/auth"
import { CCP } from "@/lib/clientCoursePermissions"
import { useState } from "react"
import { ReviewFormDialog } from "./reviews/reviewFormDialog"
import { WatchCourseGiftDialog } from "./watchCourseGiftDialog"
import { WatchCourseAddToLibraryButton } from "./watchCourseAddToLibraryButton"
import { ButtonGroup } from "@/components/ui/button-group"
import { CoursePriceBadge } from "../coursesUtils/coursePrice"

interface WatchCourseActionsProps {
  course: WatchCourseResponse
  id: string
  currentUser: UserAuthServiceUserProfileResponse | null
  scrollToReviews: () => void
}

export const WatchCourseActions = ({ course, currentUser, id, scrollToReviews }: WatchCourseActionsProps) => { 
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const resetCourseProgressMutation = useResetCourseProgressMutation()
  const toggleFavoriteCourseMutation = useToggleFavoriteCourseMutation()

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

  const handleScrollToReviews = () => {
    scrollToReviews()
    setReviewDialogOpen(true)
  }

  const canWriteReview = CCP.canCreateReview(currentUser)
  
  const totalLectures = course.sections
    .reduce((acc, section) => acc + section.lectures.length, 0)

  const handleSetFavorite = (newValue: boolean) => {
    toggleFavoriteCourseMutation.mutate({
      courseSlug: course.slug,
      payload: {
        courseId: course.id,
        newValue,
      }
    }, {
      onSuccess: () => {
        toast.success(newValue ? 'Curso añadido a favoritos' : 'Curso eliminado de favoritos')
      }
    })
  }

  const canPlayCourse = CCP.canPlayCourse(currentUser) && totalLectures > 0 && !!course.purchasedAt
  const canBuyCourse = CCP.canPlayCourse(currentUser) && totalLectures > 0 && !course.purchasedAt
  const canGiftCourse = CCP.canPlayCourse(currentUser) && totalLectures > 0

  return (
    <div className="sticky top-19.25 self-start w-full md:w-auto" id={id}>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CoursePriceBadge className="text-lg p-3" {...course} />
          </div>

          <ButtonGroup className="w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={!canPlayCourse ? '#' : `/play/${course.slug}`} className="flex-1 flex items-center gap-3">
                  <Button 
                    className="gap-2 w-full rounded-br-none! rounded-tr-none!" 
                    disabled={!canPlayCourse}
                  >
                    <PlayCircle className="h-5 w-5" />

                    {course.completedLectures === totalLectures && totalLectures > 0
                      ? "Curso completado"
                      : course.completedLectures > 0 ? "Continuar viendo" : "Comenzar curso"
                    }
                  </Button>
                </Link>
              </TooltipTrigger>

              {totalLectures === 0 ? (
                <TooltipContent className="z-999">
                  <div className="flex items-center gap-2">
                    Sin contenido
                  </div>
                </TooltipContent>
              ) : !course.purchasedAt && (
                <TooltipContent className="z-999">
                  <div className="flex items-center gap-2">
                    No en la biblioteca
                  </div>
                </TooltipContent>
              )}
            </Tooltip>

            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" className="disabled:pointer-events-auto" disabled={!CCP.canResetProgress(currentUser) || course.completedLectures === 0}>
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
          </ButtonGroup>

          <div className="flex flex-wrap gap-3">
            <ButtonGroup className="flex flex-1">
              <WatchCourseGiftDialog disabled={!canGiftCourse} courseId={course.id} />
              <WatchCourseAddToLibraryButton disabled={!canBuyCourse} course={course} />
            </ButtonGroup>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleScrollToReviews}
            disabled={!canWriteReview}
          >
            <PenLine className="size-4 mr-1.5" />
            Escribir reseña
          </Button>

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

          <ButtonGroup className="w-full mt-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn('flex-1 gap-2', course.isFavorite ? "text-destructive" : "")}
              onClick={() => handleSetFavorite(!course.isFavorite)}
              disabled={!CCP.canSetFavorite(currentUser)}
            >
              <Heart className={cn('h-4 w-4', course.isFavorite ? "fill-destructive" : "")} />
              Favorito
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
          </ButtonGroup>
        </CardContent>
      </Card>

      <ReviewFormDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        courseSlug={course.slug}
      />
    </div>
  )
}