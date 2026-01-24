import { Card } from "@/components/ui/card"
import type { CourseResponseExtended } from "@/types/courses"
import { CourseSectionCard } from "./courseSectionCard"
import { useCourseSectionsDnd } from "@/hooks/useCourseSectionsDnd"
import { closestCenter, DndContext } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { TableOfContents } from "lucide-react"

interface ModifyCourseSectionsProps {
  course: CourseResponseExtended
}

export function CourseSections({ course }: ModifyCourseSectionsProps) {
  const { sections, sensors, sectionIds, handleDragEnd } = useCourseSectionsDnd({ course })

  if(sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <TableOfContents className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Sin secciones</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Crea tu primera sección para comenzar a organizar el contenido del curso.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">  
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Card className="divide-y p-0 gap-0">
          <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
            {sections.map((section, index) => (
              <CourseSectionCard
                key={section.id}
                section={section}
                sections={sections}
                position={index + 1}
                courseId={course.id}
              />
            ))}
          </SortableContext>
        </Card>
      </DndContext>

    </div>
  )
}