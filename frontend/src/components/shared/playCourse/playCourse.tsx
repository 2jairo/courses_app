import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { WatchCourseResponse, WatchCourseLectureResponse } from "@/types/client/courses"
import type { PlayLectureResponse } from "@/types/client/lectures"
import { PlayHeader } from "./playHeader"
import { PlayLeftSidebar } from "./playLeftSidebar"
import { PlayRightSidebar } from "./playRightSidebar/playRightSidebar"
import { PlayLectureContent } from "./lectureContent/playLectureContent"
import { PlayContentNav } from "./playContentNav"
import { PlayWithoutLecture } from "./playWithoutLecture"
import { useIsMobile } from "@/hooks/use-mobile"
import { usePlayCourseSidebars } from "@/hooks/usePlayCourseSidebars"
import { PlayLectureAssets } from "./playLectureAssets"
import { ErrKind, type LocalErrorResponse } from "@/types/error"
import { getErrorMessage } from "@/lib/formatError"
import { AlertCircle, Lock } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { useWatchLecture } from "@/hooks/useWatchLecture"

interface PlayCoursePageParams {
  course: WatchCourseResponse
  currentLecture?: PlayLectureResponse
  currentLectureLoading?: boolean
  currentLectureError?: LocalErrorResponse
}

export function PlayCoursePage({ course, currentLecture, currentLectureLoading, currentLectureError }: PlayCoursePageParams) {
  useWatchLecture(currentLecture)

  const { 
    isLeftSidebarOpen, setIsLeftSidebarOpen, toggleLeftSidebar,
    isRightSidebarOpen, toggleRightSidebar
  } = usePlayCourseSidebars()
  
  const isMobile = useIsMobile()

  const handleLectureSelect = () => {
    if (isMobile) {
      setIsLeftSidebarOpen(false)
    }
  }

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

  return (
    <div className="flex-1 flex flex-col">
      <PlayHeader 
        course={course} 
        currentLecture={currentLecture}
        prevLecture={prevLecture}
        nextLecture={nextLecture}
      />

      <div className="flex h-full flex-1">
        {!isMobile && (
          <div
            className={cn(
              "h-full border-r border-border bg-card transition-all duration-300",
              isLeftSidebarOpen ? "w-100" : "w-0"
            )}
          >
            {isLeftSidebarOpen && (
              <PlayLeftSidebar 
                course={course} 
                currentLectureSlug={currentLecture?.slug}
                onLectureSelect={handleLectureSelect}
              />
            )}
          </div>
        )}

        <main className="flex-1">
          {currentLectureLoading ? (
            <div className="flex flex-col items-center justify-center h-full bg-muted/30 p-8">
              <div className="max-w-md flex items-center flex-col">
                <Spinner className="w-16 h-16"/>

                <h2 className="text-2xl font-semibold text-foreground my-3">
                  Cargando lección...
                </h2>
                <p className="text-sm text-muted-foreground">
                  Por favor espera mientras se carga el contenido
                </p>
              </div>
            </div>
          ) : currentLecture ? (
            <>
              <PlayContentNav
                course={course}
                currentLecture={currentLecture}
                isLeftSidebarOpen={isLeftSidebarOpen}
                isRightSidebarOpen={isRightSidebarOpen}
                onToggleLeftSidebar={toggleLeftSidebar}
                onToggleRightSidebar={toggleRightSidebar}
                isMobile={isMobile}
                onLectureSelect={handleLectureSelect}
              />

              <div className="p-4 lg:p-6">
                <div className="mx-auto max-w-350">
                  <PlayLectureContent key={currentLecture.slug} lecture={currentLecture} />

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
          ) : currentLectureError ? (
            <div className="flex flex-col items-center justify-center h-full bg-muted/30 p-8">
              {currentLectureError.error === ErrKind.LectureBlocked ? (
                <div className="max-w-md text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-6">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground mb-3">
                    Lección bloqueada
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {getErrorMessage(currentLectureError)}
                  </p>
                </div>
              ) : (
                <div className="max-w-md text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-6">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground mb-3">
                    Error al cargar la lección
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {getErrorMessage(currentLectureError)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <PlayWithoutLecture course={course} />
          )}
        </main>

        {!isMobile && (
          <div
            className={cn(
              "border-l border-border bg-card transition-all duration-300",
              isRightSidebarOpen ? "w-120" : "w-0"
            )}
          >
            {isRightSidebarOpen && (
              <PlayRightSidebar currentLecture={currentLecture}/>
            )}
          </div>
        )}
      </div>
    </div>
  )
}