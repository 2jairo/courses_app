import { Button } from "@/components/ui/button";
import { useMarkLectureAsSeenMutation } from "@/mutations/client/courses/useMarkLectureAsSeenMutation";
import type { WatchCourseLectureResponse, WatchCourseResponse } from "@/types/client/courses";
import type { PlayLectureResponse } from "@/types/client/lectures";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PlayHeaderCompleteLectureBtnProps {
  currentLecture: PlayLectureResponse
  nextLecture?: WatchCourseLectureResponse
  course: WatchCourseResponse
}

export function PlayHeaderCompleteLectureBtn({ currentLecture, nextLecture, course }: PlayHeaderCompleteLectureBtnProps) {
  const navigate = useNavigate()
  const markLectureAsSeenMutation = useMarkLectureAsSeenMutation()

  const handleMarkComplete = () => {
    if (!currentLecture) {
      return
    }
    if(currentLecture.seen) {
      if(nextLecture) {
        navigate(`/play/${course.slug}/${nextLecture.slug}`)
      } 
      return
    }

    markLectureAsSeenMutation.mutate({
      payload: {
        courseId: course.id,
        lectureId: currentLecture.id,
      },
      courseSlug: course.slug,
      lectureSlug: currentLecture.slug
    }, {
      onSuccess: () => {
        toast.success("Lección completada")
      }
    })

    if(nextLecture) {
      navigate(`/play/${course.slug}/${nextLecture.slug}`)
    }
  }

  return (
    <Button
      variant={currentLecture.seen || currentLecture.kind === 'Quiz' ? 'secondary' : 'default'}
      disabled={currentLecture.kind === 'Quiz'}
      size="sm"
      onClick={handleMarkComplete}
      className="h-8 gap-1.5"
    >
      {currentLecture.seen ? (
        <>
          <Check className="h-4 w-4" />
          <span className="hidden sm:inline">Completado</span>
        </>
      ) : (
        <span>Completar lección</span>
      )}
    </Button>
  )
}