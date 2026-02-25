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
import type { ExtendedQuizResponseQuestion } from "@/types/dashboard/quizzes"
import { DndUtils } from "@/lib/dndUtils"
import { useUpdateQuestionPositionMutation } from "@/mutations/dashboard/quizzesQuestions/useUpdateQuestionPositionMutation"

interface UseQuizQuestionsDndProps {
  questions: ExtendedQuizResponseQuestion[]
  quizId: number
  courseId: number
}

export function useQuizQuestionsDnd({ questions: initialQuestions, quizId, courseId }: UseQuizQuestionsDndProps) {
  const [questions, setQuestions] = useState<ExtendedQuizResponseQuestion[]>(initialQuestions)
  const updatePositionMutation = useUpdateQuestionPositionMutation()

  useEffect(() => {
    setQuestions(initialQuestions)
  }, [initialQuestions])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const questionIds = useMemo(
    () => questions.map((q) => DndUtils.quizQuestionId(q.id)),
    [questions]
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => DndUtils.quizQuestionId(q.id) === active.id)
      const newIndex = questions.findIndex((q) => DndUtils.quizQuestionId(q.id) === over.id)

      const newQuestions = arrayMove(questions, oldIndex, newIndex)
      setQuestions(newQuestions)

      const movedQuestion = questions[oldIndex]
      updatePositionMutation.mutate({
        payload: {
          questionId: movedQuestion.id,
          quizId,
          position: newIndex + 1,
        },
        courseId,
      })
    }
  }

  return {
    questions,
    sensors,
    questionIds,
    handleDragEnd,
  }
}
