import { PanelLeft, PanelLeftClose, PanelRight, PanelRightClose } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { PlayLeftSidebar } from "./playLeftSidebar"
import { PlayRightSidebar } from "./playRightSidebar/playRightSidebar"
import type { WatchCourseResponse } from "@/types/client/courses"
import type { PlayLectureResponse } from "@/types/client/lectures"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PlayContentNavProps {
  course: WatchCourseResponse
  currentLecture?: PlayLectureResponse
  isLeftSidebarOpen: boolean
  isRightSidebarOpen: boolean
  onToggleLeftSidebar: () => void
  onToggleRightSidebar: () => void
  isMobile: boolean
  onLectureSelect?: () => void
}

export function PlayContentNav({
  course,
  currentLecture,
  isLeftSidebarOpen,
  isRightSidebarOpen,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  isMobile,
  onLectureSelect,
}: PlayContentNavProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2 shrink-0">
      {/* Toggle Left Sidebar Button - Desktop */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleLeftSidebar}
          className="h-8 gap-2"
        >
          {isLeftSidebarOpen ? (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="hidden xl:block">Ocultar contenido</span>
            </>
          ) : (
            <>
              <PanelLeft className="h-4 w-4" />
              <span className="hidden xl:block">Mostrar contenido</span>
            </>
          )}
        </Button>
      )}

      {/* Toggle Left Sidebar Button - Mobile */}
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2">
              <PanelLeft className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="max-w-full! w-[95%]! p-0 z-900">
            <SheetTitle className="sr-only">Contenido del curso</SheetTitle>
            <ScrollArea className="h-full">
              <PlayLeftSidebar
                course={course}
                currentLectureSlug={currentLecture?.slug}
                onLectureSelect={onLectureSelect}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}

      <h1 className="flex-1 truncate text-sm font-medium text-foreground text-center">
        {currentLecture?.title}
      </h1>

      {/* Toggle Right Sidebar Button - Desktop */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleRightSidebar}
          className="h-8 gap-2 ml-auto"
        >
          {isRightSidebarOpen ? (
            <>
              <span className="hidden xl:block">Ocultar comentarios</span>
              <PanelRightClose className="h-4 w-4" />
            </>
          ) : (
            <>
              <span className="hidden xl:block">Mostrar comentarios</span>
              <PanelRight className="h-4 w-4" />
            </>
          )}
        </Button>
      )}

      {/* Toggle Right Sidebar Button - Mobile */}
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2 ml-auto">
              <PanelRight className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="max-w-full! w-[95%]! p-0">
            <SheetTitle className="sr-only">Comentarios de la clase</SheetTitle>
            <ScrollArea className="h-full">
              <PlayRightSidebar currentLecture={currentLecture} />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
