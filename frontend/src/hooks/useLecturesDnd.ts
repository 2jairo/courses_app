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
import type { LectureResponseExtended } from "@/types/lectures"
import { DndUtils } from "@/lib/dndUtils"
import { useUpdateLecturePositionMutation } from "@/mutations/dashboard/lectures/useUpdateLecturePositionMutation"

interface UseLecturesDndProps {
  lectures: LectureResponseExtended[]
  sectionId: number
  courseId: number
}

export function useLecturesDnd({ lectures: initialLectures, sectionId, courseId }: UseLecturesDndProps) {
  const [lectures, setLectures] = useState<LectureResponseExtended[]>(initialLectures)
  const updatePositionMutation = useUpdateLecturePositionMutation()

  useEffect(() => {
    setLectures(initialLectures)
  }, [initialLectures])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const lectureIds = useMemo(
    () => lectures.map((l) => DndUtils.lectureId(l.id)),
    [lectures]
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = lectures.findIndex((l) => DndUtils.lectureId(l.id) === active.id)
      const newIndex = lectures.findIndex((l) => DndUtils.lectureId(l.id) === over.id)

      const newLectures = arrayMove(lectures, oldIndex, newIndex)
      setLectures(newLectures)

      // Update position on the server
      const movedLecture = lectures[oldIndex]
      updatePositionMutation.mutate({
        lectureId: movedLecture.id,
        position: newIndex + 1, // Assuming 1-based position
        courseSectionId: sectionId,
        courseId,
      })
    }
  }

  return {
    lectures,
    sensors,
    lectureIds,
    handleDragEnd,
  }
}
