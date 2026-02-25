import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useSetAnswerMutation } from "@/mutations/client/quizzes/useSetAnswerMutation"
import type { StartQuizAttemptResponseQuestion } from "@/types/client/quizzes"
import {
  buildPlayQuizQuestionTextMultipleFormSchema,
  type PlayQuizQuestionTextMultipleFormSchema,
} from "../playQuizQuestionFormSchemas"

interface TextMultipleQuestionProps {
  question: StartQuizAttemptResponseQuestion & { kind: "TextMultiple" }
  lectureSlug: string
  onAnswered: () => void
}

export function TextMultipleQuestion({ question, lectureSlug, onAnswered }: TextMultipleQuestionProps) {
  const setAnswerMutation = useSetAnswerMutation()
  const total = question.options.totalKeywords

  const { register, handleSubmit, formState: { errors } } = useForm<PlayQuizQuestionTextMultipleFormSchema>({
    resolver: zodResolver(buildPlayQuizQuestionTextMultipleFormSchema(total)),
    defaultValues: {
      choicesId: question.answer?.choicesId ?? Array(total).fill(""),
    },
  })

  const onSubmit = (values: PlayQuizQuestionTextMultipleFormSchema) => {
    setAnswerMutation.mutate(
      { lectureSlug, questionId: question.id, kind: "TextMultiple", answer: values },
      { onSuccess: onAnswered }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ingresa {total} palabra(s) clave relacionada(s) al tema.
      </p>
      <div className="space-y-3">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Label htmlFor={`text-multi-${i}`}>Palabra clave {i + 1}</Label>
            <Input
              id={`text-multi-${i}`}
              placeholder={`Palabra clave ${i + 1}`}
              {...register(`choicesId.${i}`)}
            />
            {errors.choicesId?.[i] && (
              <p className="text-sm text-destructive">{errors.choicesId[i]?.message}</p>
            )}
          </div>
        ))}
      </div>
      {(errors.choicesId as { message?: string } | undefined)?.message && (
        <p className="text-sm text-destructive">
          {(errors.choicesId as { message?: string }).message}
        </p>
      )}
      <Button type="submit" disabled={setAnswerMutation.isLoading} className="w-full">
        {setAnswerMutation.isLoading ? "Guardando..." : "Guardar respuesta"}
      </Button>
    </form>
  )
}
