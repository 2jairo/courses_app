import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { formatDuration } from "@/lib/format"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { WatchCourseResponse, WatchCourseLectureResponse } from "@/types/client/courses"
import type { PlayLectureResponse } from "@/types/client/lectures"
import { LectureKindBadge } from "../lecturesUtils/lectureKindIcon"
import { PlayHeaderCompleteLectureBtn } from "./playHeaderCompleteLectureButton"
import { CourseUtilsDropdownMenu } from "../coursesUtils/courseUtilsDropdownMenu"

interface PlayHeaderProps {
  course: WatchCourseResponse
  currentLecture?: PlayLectureResponse
  prevLecture?: WatchCourseLectureResponse
  nextLecture?: WatchCourseLectureResponse
}

export function PlayHeader({ 
  course, 
  currentLecture,
  prevLecture,
  nextLecture,
}: PlayHeaderProps) {
  return (
    <TooltipProvider>
      <header className="border-b border-border bg-background shrink-0">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left Section - Navigation back to course */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={`/watch/${course.slug}`}>
                  <Button variant="ghost" asChild>
                    <div>
                      <ChevronLeft className="h-4 w-4" />
                      {course.title}
                    </div>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Volver al curso</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  disabled={!prevLecture}
                  asChild={!!prevLecture}
                >
                  {prevLecture && !prevLecture.isBlocked ? (
                    <Link to={`/play/${course.slug}/${prevLecture.slug}`}>
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span>
                      <ChevronLeft className="h-4 w-4 text-muted-foreground opacity-50" />
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {prevLecture ? prevLecture.title : 'No hay lección anterior'}
              </TooltipContent>
            </Tooltip>

            {currentLecture && (
              <div className="hidden md:flex items-center gap-2 px-3">
                <LectureKindBadge lectureKind={currentLecture.kind} />

                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(currentLecture.estimatedDurationSecs, true)}
                </span>
              </div>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  disabled={!nextLecture}
                  asChild={!!nextLecture}
                >
                  {nextLecture && !nextLecture.isBlocked ? (
                    <Link to={`/play/${course.slug}/${nextLecture.slug}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {nextLecture ? nextLecture.title : 'No hay lección siguiente'}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {currentLecture && (
              <PlayHeaderCompleteLectureBtn 
                currentLecture={currentLecture}
                nextLecture={nextLecture}
                course={course}
              />
            )}

            <CourseUtilsDropdownMenu course={course} currentLecture={currentLecture}/>
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}
