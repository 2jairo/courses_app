import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import type { CouseSectionResponseExtended } from "@/types/courses"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { DndUtils } from "@/lib/dndUtils"
import { useLecturesDnd } from "@/hooks/useLecturesDnd"
import { closestCenter, DndContext } from "@dnd-kit/core"
import { CourseSectionCardActions } from "./courseSectionCardActions"
import { LectureCard } from "../lectures/lectureCard"


interface SortableSectionProps {
  section: CouseSectionResponseExtended
  sections: CouseSectionResponseExtended[]
  position: number
  courseId: number
}

export function CourseSectionCard({ section, position, courseId, sections }: SortableSectionProps) {
  const { lectures, sensors, lectureIds, handleDragEnd } = useLecturesDnd({
    lectures: section.lectures,
    sectionId: section.id,
    courseId,
  })

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: DndUtils.courseSectionId(section.id) })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  
  const publicLectures = section
    .lectures
    .filter((lecture) => lecture.visibility === "Public")
    .length

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-2"
    >
      <Accordion type="single" collapsible>
        <AccordionItem value={section.id.toString()}>
          <AccordionTrigger className="hover:no-underline px-0 py-0 gap-4 items-center">
            <div className="flex items-center gap-4 flex-1">
              <div
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
              >
                <GripVertical className="h-5 w-5" />
              </div>

              <div>
                <div className="font-medium">{section.title}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  {publicLectures}/{section.lectures.length} públicas
                </Badge>
                <Badge variant="outline" className="text-xs">
                  #{position}
                </Badge>
              </div>
              <CourseSectionCardActions section={section} courseId={courseId} />
            </div>
          </AccordionTrigger>

          <AccordionContent className="p-2" key={`lectures-${lectures.length}`}>
            {lectures.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="border divide-y flex flex-col rounded-md ml-9">
                  <SortableContext items={lectureIds} strategy={verticalListSortingStrategy}>
                    {lectures.map((lecture, index) => (
                      <LectureCard 
                        key={lecture.id} 
                        lecture={lecture} 
                        index={index}
                        currentSectionId={section.id}
                        courseId={courseId}
                        sections={sections}
                      />
                    ))}
                  </SortableContext>
                </div>
              </DndContext>
            ) : (
              <div className="text-xs text-muted-foreground ml-9">
                No hay lecciones en esta sección
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
