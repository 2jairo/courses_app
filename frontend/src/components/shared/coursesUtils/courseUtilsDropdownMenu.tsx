import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { WatchCourseResponse } from "@/types/client/courses"
import type { PlayLectureResponse } from "@/types/client/lectures"
import { Flag, MoreHorizontal, Share2 } from "lucide-react"
import { toast } from "sonner"

export interface CourseUtilsDropdownMenuProps {
  course: WatchCourseResponse
  currentLecture?: PlayLectureResponse
}

export const CourseUtilsDropdownMenu = ({ course, currentLecture }: CourseUtilsDropdownMenuProps) => {
  const handleShare = () => {
    if (navigator.share) {
      const name = import.meta.env.VITE_COURSE_APP_NAME

      navigator.share({
        title: currentLecture
          ? `${name}: ${course.title} - ${currentLecture?.title}`
          : `${name}: ${course.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success("URL copiada al portapapeles")
      })
    }
  }

  const reportProblem = () => {
  
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Compartir {currentLecture ? "lección" : "curso"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={reportProblem}>
          <Flag className="mr-2 h-4 w-4" />
          Reportar problema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}