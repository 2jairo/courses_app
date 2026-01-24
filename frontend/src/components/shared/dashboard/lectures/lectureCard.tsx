import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import type { LectureResponseExtended } from "@/types/lectures"
import { LectureCardActions } from "./lectureCardActions"
import { DndUtils } from "@/lib/dndUtils"
import { LectureKindBadge, LectureKindIcon } from "../../lecturesUtils/lectureKindIcon"
import { LectureVisibilityBadge } from "../../lecturesUtils/lectureVisibility"

interface SectionOption {
  id: number
  title: string
  position: number
}

interface SortableCourseLectureCardProps {
  index: number
  lecture: LectureResponseExtended
  currentSectionId: number
  courseId: number
  sections: SectionOption[]
}

export function LectureCard({ index, lecture, currentSectionId, sections, courseId }: SortableCourseLectureCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: DndUtils.lectureId(lecture.id) })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 py-2 px-3 overflow-hidden border border-transparent hover:bg-muted/50 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="shrink-0 pt-0.5">
        <LectureKindIcon lectureKind={lecture.kind} className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm leading-tight truncate">
          {index + 1}. {lecture.title}
        </h4>
      </div>

      <LectureVisibilityBadge visibility={lecture.visibility}/>
      <LectureKindBadge lectureKind={lecture.kind} />

      <LectureCardActions 
        courseId={courseId}
        lecture={lecture} 
        currentSectionId={currentSectionId}
        sections={sections}
      />
    </div>
  )
}
