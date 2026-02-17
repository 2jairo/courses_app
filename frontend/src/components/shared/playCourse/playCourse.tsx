import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { WatchCourseResponse, WatchCourseLectureResponse } from "@/types/client/courses"
import type { PlayLectureResponse } from "@/types/client/lectures"
import { PlayHeader } from "./playHeader"
import { PlaySidebar } from "./playSidebar"
import { PlayLectureContent } from "./lectureContent/playLectureContent"
import { PlayContentNav } from "./playContentNav"
import { PlayWithoutLecture } from "./playWithoutLecture"
import { useIsMobile } from "@/hooks/use-mobile"
import { useMarkLectureAsSeenMutation } from "@/mutations/client/courses/useMarkLectureAsSeenMutation"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { PlayLectureAssets } from "./playLectureAssets"

interface PlayCoursePageParams {
  course: WatchCourseResponse
  currentLecture?: PlayLectureResponse
}

export function PlayCoursePage({ course, currentLecture }: PlayCoursePageParams) {
  const markAsSeenMutation = useMarkLectureAsSeenMutation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  // Find prev/next lectures
  const { prevLecture, nextLecture } = useMemo(() => {
    const allLectures: WatchCourseLectureResponse[] = course.sections
      .sort((a, b) => a.position - b.position)
      .flatMap(s => s.lectures.sort((a, b) => a.position - b.position))
    
    const currentIndex = allLectures.findIndex(l => l.slug === currentLecture?.slug)
    
    return {
      prevLecture: currentIndex > 0 ? allLectures[currentIndex - 1] : undefined,
      nextLecture: currentIndex < allLectures.length - 1 ? allLectures[currentIndex + 1] : undefined,
    }
  }, [course.sections, currentLecture?.slug])

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  const handleLectureSelect = () => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

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

    markAsSeenMutation.mutate({
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
    <div className="flex-1 flex flex-col">
      <PlayHeader 
        course={course} 
        currentLecture={currentLecture}
        prevLecture={prevLecture}
        nextLecture={nextLecture}
        onMarkComplete={handleMarkComplete}
      />

      <div className="flex flex-1">
        {!isMobile && (
          <div
            className={cn(
              "border-r border-border bg-card transition-all duration-300",
              isSidebarOpen ? "w-80" : "w-0"
            )}
          >
            {isSidebarOpen && (
              <PlaySidebar 
                course={course} 
                currentLectureSlug={currentLecture?.slug}
                onLectureSelect={handleLectureSelect}
              />
            )}
          </div>
        )}

        <main className="flex-1">
          {currentLecture ? (
            <>
              <PlayContentNav
                course={course}
                currentLecture={currentLecture}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={toggleSidebar}
                isMobile={isMobile}
                onLectureSelect={handleLectureSelect}
              />

              <div className="p-4 lg:p-6">
                <div className="mx-auto max-w-350">
                  <PlayLectureContent lecture={currentLecture} />

                  {/* Lecture Assets */}
                  {currentLecture.assets.length > 0 && (
                    <PlayLectureAssets assets={currentLecture.assets} />
                  )}

                  {/* Lecture Description */}
                  <div className="mt-6 rounded-lg border border-border bg-card p-4">
                    <h2 className="text-lg font-semibold text-foreground">
                      Sobre esta lección
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {currentLecture.description || "Sin descripción disponible."}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <PlayWithoutLecture course={course} />
          )}
        </main>
      </div>
    </div>
  )
}