import { Card } from "@/components/ui/card"
import { closestCenter, DndContext } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useQuizQuestionsDnd } from "@/hooks/useQuizQuestionsDnd"
import { QuizQuestionCard } from "./quizQuestionCard"
import { HelpCircle } from "lucide-react"
import type { ExtendedQuizResponseQuestion } from "@/types/dashboard/quizzes"

interface QuizQuestionsListProps {
  questions: ExtendedQuizResponseQuestion[]
  courseId: number
  quizId: number
}

export function QuizQuestionsList({ questions: initialQuestions, courseId, quizId }: QuizQuestionsListProps) {
  const { questions, sensors, questionIds, handleDragEnd } = useQuizQuestionsDnd({
    questions: initialQuestions,
    quizId,
    courseId,
  })

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <HelpCircle className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Sin preguntas</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Crea tu primera pregunta para comenzar a armar el cuestionario.
        </p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Card className="divide-y p-0 gap-0">
        <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
          {questions.map((question, index) => (
            <QuizQuestionCard
              key={question.id}
              question={question}
              index={index}
              courseId={courseId}
              quizId={quizId}
            />
          ))}
        </SortableContext>
      </Card>
    </DndContext>
  )
}
