import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DndUtils } from "@/lib/dndUtils"
import { QuizQuestionCardActions } from "./quizQuestionCardActions"
import type { ExtendedQuizResponseQuestion } from "@/types/dashboard/quizzes"
import { QuizQuestionKindBadge } from "../../quizzesQuestionsUtils/quizQuestionKind"
import { QuizQuestionStatusBadge } from "../../quizzesQuestionsUtils/quizQuestionStatus"

function getOptionsCount(question: ExtendedQuizResponseQuestion): number | null {
  switch (question.kind) {
    case "BoolMultiple":
    case "BoolSingle":
      return question.options.choices.length
    case "TextMultiple":
      return question.options.keywords.length
    case "Match":
      return question.options.pairs.length
    case "Ordering":
      return question.options.items.length
    default:
      return null
  }
}

interface QuizQuestionCardProps {
  question: ExtendedQuizResponseQuestion
  index: number
  courseId: number
  quizId: number
}

export function QuizQuestionCard({ question, index, courseId, quizId }: QuizQuestionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: DndUtils.quizQuestionId(question.id) })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const optionsCount = getOptionsCount(question)

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

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm leading-tight truncate">
          {index + 1}. {question.questionText}
        </h4>
      </div>

      <QuizQuestionKindBadge variant="secondary" kind={question.kind}/>
      <QuizQuestionStatusBadge status={question.status}/>

      {optionsCount !== null && (
        <Badge variant="outline" className="text-xs shrink-0">
          {optionsCount} opc.
        </Badge>
      )}

      <Badge variant="outline" className="text-xs shrink-0">
        {question.points} pts
      </Badge>

      <QuizQuestionCardActions
        question={question}
        courseId={courseId}
        quizId={quizId}
      />
    </div>
  )
}
