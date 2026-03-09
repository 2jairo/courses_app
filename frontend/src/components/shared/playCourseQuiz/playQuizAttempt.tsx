import { useState, useRef } from "react"
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
} from "@/components/ui/alert-dialog"
import { useFinishQuizAttemptMutation } from "@/mutations/client/quizzes/useFinishQuizAttemptMutation"
import type { SetAnswerRequestAnswer, StartQuizAttemptResponse } from "@/types/client/quizzes"
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
import { useSetAnswerMutation } from "@/mutations/client/quizzes/useSetAnswerMutation"
import { Spinner } from "@/components/ui/spinner"

interface QuizAttemptProps {
  attempt: StartQuizAttemptResponse
  lecture: PlayLectureResponse & { kind: "Quiz"; data: PlayLectureResponseKindQuiz }
  onFinished: () => void
}

export function QuizAttempt({ attempt, lecture, onFinished }: QuizAttemptProps) {
  const finishQuizAttemptMutation = useFinishQuizAttemptMutation()
  const setAnswerMutation = useSetAnswerMutation()

  const [currentIndex, setCurrentIndex] = useState(() => {
    return attempt.questions.findIndex((q) => !q.answer) || 0
  })
  const [answers, setAnswers] = useState<{ [id: number]: SetAnswerRequestAnswer[keyof SetAnswerRequestAnswer] }>(
    () => Object.fromEntries(attempt.questions
      .filter((q) => !!q.answer)
      .map((q) => [q.id, q.answer!])
    )
  )

  const totalQuestions = attempt.questions.length
  const answeredCount = Object.keys(answers).length
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0
  const currentQuestion = attempt.questions[currentIndex]
  const isFirstQuestion = currentIndex === 0
  const isLastQuestion = currentIndex === totalQuestions - 1

  const handleFinish = () => {
    finishQuizAttemptMutation.mutate({
      lectureSlug: lecture.slug
    }, {
      onSuccess: onFinished
    })
  }

  const pendingNavIdxRef = useRef(0)
  const pendingFinishRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleQuestionFormSubmit = (answer: any) => {
    setAnswerMutation.mutate(
      {
        lectureSlug: lecture.slug,
        questionId: currentQuestion.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        kind: currentQuestion.kind as any,
        answer,
      },
      {
        onSuccess: () => {
          setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }))
          if (pendingFinishRef.current) {
            pendingFinishRef.current = false
            setIsFinishDialogOpen(true)
          } else {
            setCurrentIndex(pendingNavIdxRef.current)
          }
        },
      }
    )
  }

  const handleSaveAnswer = (newIdx: number) => {
    pendingNavIdxRef.current = newIdx
    formRef.current?.requestSubmit()
  }

  const handleFinishClick = () => {
    pendingFinishRef.current = true
    pendingNavIdxRef.current = currentIndex
    formRef.current?.requestSubmit()
  }

  const questionKindCommponProps = {
    formRef: formRef,
    onSubmit: handleQuestionFormSubmit,
    onInvalidSubmit: () => {
      if (pendingFinishRef.current) {
        pendingFinishRef.current = false
        setIsFinishDialogOpen(true)
      } else {
        setCurrentIndex(pendingNavIdxRef.current)
      }
    },
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
          const isAnswered = !!answers[q.id]
          const isCurrent = i === currentIndex

          return (
            <Tooltip key={q.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleSaveAnswer(i)}
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

        {currentQuestion.kind === "BoolSingle" && <BoolSingleQuestion {...questionKindCommponProps} question={currentQuestion} />}
        {currentQuestion.kind === "BoolMultiple" && <BoolMultipleQuestion {...questionKindCommponProps} question={currentQuestion} />}
        {currentQuestion.kind === "TextSingle" && <TextSingleQuestion {...questionKindCommponProps} question={currentQuestion} />}
        {currentQuestion.kind === "TextMultiple" && <TextMultipleQuestion {...questionKindCommponProps} question={currentQuestion} />}
        {currentQuestion.kind === "Match" && <MatchQuestion {...questionKindCommponProps} question={currentQuestion} />}
        {currentQuestion.kind === "Ordering" && <OrderingQuestion {...questionKindCommponProps} question={currentQuestion} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={isFirstQuestion || setAnswerMutation.isLoading}
          onClick={() => handleSaveAnswer(currentIndex - 1)}
        >
          {setAnswerMutation.isLoading
            ? <Spinner />
            : <ChevronLeft className="h-4 w-4 mr-1" />
          }
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={setAnswerMutation.isLoading || isLastQuestion}
            onClick={() => handleSaveAnswer(currentIndex + 1)}
          >
            Siguiente
            {setAnswerMutation.isLoading
              ? <Spinner />
              : <ChevronRight className="h-4 w-4 ml-1" /> 
            }
          </Button>

          <Button
            size="sm"
            variant={answeredCount === totalQuestions ? "default" : "outline"}
            disabled={finishQuizAttemptMutation.isLoading || setAnswerMutation.isLoading}
            onClick={handleFinishClick}
          >
            {finishQuizAttemptMutation.isLoading || setAnswerMutation.isLoading
              ? <Spinner />
              : <Trophy className="h-4 w-4 mr-1.5" />
            }

            Finalizar intento
          </Button>

          <AlertDialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
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
