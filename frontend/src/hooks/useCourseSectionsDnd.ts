import { useState, useMemo, useEffect } from "react"
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import type { CourseResponseExtended, CouseSectionResponseExtended } from "@/types/dashboard/courses"
import { DndUtils } from "@/lib/dndUtils"
import { useUpdateCourseSectionPositionMutation } from "@/mutations/dashboard/courseSections/useUpdateCourseSectionPositionMutation"

interface UseCourseSectionsDndProps {
  course: CourseResponseExtended
}

export function useCourseSectionsDnd({ course }: UseCourseSectionsDndProps) {
  const [sections, setSections] = useState<CouseSectionResponseExtended[]>(course.sections)
  const updatePositionMutation = useUpdateCourseSectionPositionMutation()

  useEffect(() => {
    setSections(course.sections)
  }, [course])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const sectionIds = useMemo(
    () => sections.map((s) => DndUtils.courseSectionId(s.id)),
    [sections]
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => DndUtils.courseSectionId(s.id) === active.id)
      const newIndex = sections.findIndex((s) => DndUtils.courseSectionId(s.id) === over.id)

      const newSections = arrayMove(sections, oldIndex, newIndex)
      setSections(newSections)

      // Update position on the server
      const movedSection = sections[oldIndex]
      updatePositionMutation.mutate({
        sectionId: movedSection.id,
        position: newIndex + 1, // Assuming 1-based position
        courseId: course.id,
      })
    }
  }

  return {
    sections,
    sensors,
    sectionIds,
    handleDragEnd,
  }
}
