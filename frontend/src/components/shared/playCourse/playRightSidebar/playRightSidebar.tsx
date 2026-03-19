import { ScrollArea } from "@/components/ui/scroll-area"
import { LectureCommentsList } from "../../lectureComments/lectureCommentsList"
import type { PlayLectureResponse } from "@/types/client/lectures"

interface PlayRightSidebarProps {
  currentLecture?: PlayLectureResponse
}

export function PlayRightSidebar({ currentLecture }: PlayRightSidebarProps) {
  return (
    <aside className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold text-foreground line-clamp-2">
          Comentarios
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {currentLecture ? (
            currentLecture.kind === 'Quiz' ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                Los cuestionarios no tienen comentarios.
              </div>
            ) : (
              <LectureCommentsList lectureSlug={currentLecture.slug} />
            )
          ) : (
            <div className="text-sm text-muted-foreground text-center py-8">
              Selecciona una clase para ver sus comentarios.
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}