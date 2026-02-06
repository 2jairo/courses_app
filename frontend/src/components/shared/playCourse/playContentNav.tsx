import { PanelLeft, PanelLeftClose } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { PlaySidebar } from "./playSidebar"
import type { WatchCourseResponse } from "@/types/client/courses"
import type { PlayLectureResponse } from "@/types/client/lectures"

interface PlayContentNavProps {
  course: WatchCourseResponse
  currentLecture?: PlayLectureResponse
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  isMobile: boolean
  onLectureSelect?: () => void
}

export function PlayContentNav({
  course,
  currentLecture,
  isSidebarOpen,
  onToggleSidebar,
  isMobile,
  onLectureSelect,
}: PlayContentNavProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-2 shrink-0">
      {/* Toggle Sidebar Button - Desktop */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="h-8 gap-2"
        >
          {isSidebarOpen ? (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="sr-only lg:not-sr-only">Ocultar contenido</span>
            </>
          ) : (
            <>
              <PanelLeft className="h-4 w-4" />
              <span className="sr-only lg:not-sr-only">Mostrar contenido</span>
            </>
          )}
        </Button>
      )}

      {/* Mobile Sidebar Trigger */}
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2">
              <PanelLeft className="h-4 w-4" />
              <span>Contenido del curso</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 z-900">
            <PlaySidebar
              course={course}
              currentLectureSlug={currentLecture?.slug}
              onLectureSelect={onLectureSelect}
            />
          </SheetContent>
        </Sheet>
      )}

      <h1 className="flex-1 truncate text-sm font-medium text-foreground">
        {currentLecture?.title}
      </h1>
    </div>
  )
}
