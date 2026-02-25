import { useState } from "react"
import { CheckCircle2, ChevronLeft, ChevronRight, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useFinishQuizAttemptMutation } from "@/mutations/client/quizzes/useFinishQuizAttemptMutation"
import type { StartQuizAttemptResponse } from "@/types/client/quizzes"
import { QuizTimer } from "./playQuizTimer"
import { QuizQuestionKindBadge } from "../quizzesQuestionsUtils/quizQuestionKind"
import { BoolSingleQuestion } from "./questions/boolSingleQuestion"
import type { PlayLectureResponse, PlayLectureResponseKindQuiz } from "@/types/client/lectures"
import { BoolMultipleQuestion } from "./questions/boolMultipleQuestion"
import { TextSingleQuestion } from "./questions/textSingleQuestion"
import { TextMultipleQuestion } from "./questions/textMultipleQuestion"
import { MatchQuestion } from "./questions/matchQuestion"
import { OrderingQuestion } from "./questions/orderingQuestion"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface QuizAttemptProps {
  attempt: StartQuizAttemptResponse
  lecture: PlayLectureResponse & { kind: "Quiz"; data: PlayLectureResponseKindQuiz }
  onFinished: () => void
}

export function QuizAttempt({ attempt, lecture, onFinished }: QuizAttemptProps) {
  const finishQuizAttemptMutation = useFinishQuizAttemptMutation()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answeredPositions, setAnsweredPositions] = useState<Set<number>>(
    () => new Set(attempt.questions.filter((q) => q.answer != null).map((q) => q.position))
  )

  const totalQuestions = attempt.questions.length
  const answeredCount = answeredPositions.size
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0
  const currentQuestion = attempt.questions[currentIndex]
  const isFirstQuestion = currentIndex === 0
  const isLastQuestion = currentIndex === totalQuestions - 1

  const handleAnswered = () => {
    setAnsweredPositions((prev) => new Set(prev).add(currentQuestion.position))
    if (!isLastQuestion) {
      setCurrentIndex((i) => i + 1)
    }
  }

  const handleFinish = () => {
    finishQuizAttemptMutation.mutate({
      lectureSlug: lecture.slug
    }, {
      onSuccess: onFinished
    })
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Pregunta {currentIndex + 1} de {totalQuestions}
          </span>
          <Badge variant="outline" className="text-xs">
            {currentQuestion.points} {currentQuestion.points === 1 ? "punto" : "puntos"}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {attempt.expiresAt && (
            <QuizTimer expiresAt={attempt.expiresAt} onExpire={handleFinish} />
          )}
          <span className="text-xs text-muted-foreground">
            {answeredCount}/{totalQuestions} respondidas
          </span>
        </div>
      </div>

      <Progress value={progress} className="h-1.5" />

      {/* Question dots navigation */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {attempt.questions.map((q, i) => {
          const isAnswered = answeredPositions.has(q.position)
          const isCurrent = i === currentIndex
          return (
            <Tooltip key={q.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={cn("h-7 w-7 rounded-full text-xs font-medium transition-all border",
                    isCurrent ? "border-primary bg-primary text-primary-foreground" : "",
                    isAnswered && !isCurrent ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400" : "",
                    !isAnswered && !isCurrent ? "border-muted-foreground/30 bg-muted/30 text-muted-foreground hover:border-muted-foreground" : "",
                  )}
                >
                  {isAnswered && !isCurrent ? (
                    <CheckCircle2 className="h-3.5 w-3.5 mx-auto" />
                  ) : (
                    i + 1
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>Ir a pregunta {i + 1}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      {/* Question content */}
      <div className="rounded-xl bg-card space-y-6 shadow-sm">
        <div className="space-y-4">
          <QuizQuestionKindBadge kind={currentQuestion.kind}/>
          <h3 className="text-base font-semibold leading-snug">{currentQuestion.questionText}</h3>
        </div>

        {currentQuestion.kind === "BoolSingle" && <BoolSingleQuestion question={currentQuestion} lectureSlug={lecture.slug} onAnswered={handleAnswered} />}
        {currentQuestion.kind === "BoolMultiple" && <BoolMultipleQuestion question={currentQuestion} lectureSlug={lecture.slug} onAnswered={handleAnswered} />}
        {currentQuestion.kind === "TextSingle" && <TextSingleQuestion question={currentQuestion} lectureSlug={lecture.slug} onAnswered={handleAnswered} />}
        {currentQuestion.kind === "TextMultiple" && <TextMultipleQuestion question={currentQuestion} lectureSlug={lecture.slug} onAnswered={handleAnswered} />}
        {currentQuestion.kind === "Match" && <MatchQuestion question={currentQuestion} lectureSlug={lecture.slug} onAnswered={handleAnswered} />}
        {currentQuestion.kind === "Ordering" && <OrderingQuestion question={currentQuestion} lectureSlug={lecture.slug} onAnswered={handleAnswered} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={isFirstQuestion}
          onClick={() => setCurrentIndex((i) => i - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          {!isLastQuestion && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((i) => i + 1)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant={answeredCount === totalQuestions ? "default" : "outline"}
                disabled={finishQuizAttemptMutation.isLoading}
              >
                <Trophy className="h-4 w-4 mr-1.5" />
                Finalizar intento
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Finalizar el intento?</AlertDialogTitle>
                <AlertDialogDescription>
                  {answeredCount < totalQuestions ? (
                    <>
                      Aún tienes{" "}
                      <strong>{totalQuestions - answeredCount}</strong>{" "}
                      {totalQuestions - answeredCount === 1 ? "pregunta sin responder" : "preguntas sin responder"}.
                      Una vez finalizado no podrás hacer cambios.
                    </>
                  ) : (
                    "Has respondido todas las preguntas. Una vez finalizado no podrás hacer cambios."
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleFinish} disabled={finishQuizAttemptMutation.isLoading}>
                  {finishQuizAttemptMutation.isLoading ? "Finalizando..." : "Sí, finalizar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
