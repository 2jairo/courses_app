import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useSetAnswerMutation } from "@/mutations/client/quizzes/useSetAnswerMutation"
import type { StartQuizAttemptResponseQuestion } from "@/types/client/quizzes"
import { playQuizQuestionTextSingleFormSchema, type PlayQuizQuestionTextSingleFormSchema } from "../playQuizQuestionFormSchemas"

interface TextSingleQuestionProps {
  question: StartQuizAttemptResponseQuestion & { kind: "TextSingle" }
  lectureSlug: string
  onAnswered: () => void
}

export function TextSingleQuestion({ question, lectureSlug, onAnswered }: TextSingleQuestionProps) {
  const setAnswerMutation = useSetAnswerMutation()

  const { register, handleSubmit, formState: { errors } } = useForm<PlayQuizQuestionTextSingleFormSchema>({
    resolver: zodResolver(playQuizQuestionTextSingleFormSchema),
    defaultValues: {
      choice: question.answer?.choice ?? "",
    },
  })

  const onSubmit = (values: PlayQuizQuestionTextSingleFormSchema) => {
    setAnswerMutation.mutate(
      { lectureSlug, questionId: question.id, kind: "TextSingle", answer: values },
      { onSuccess: onAnswered }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-single-input">Tu respuesta</Label>
        <Input
          id="text-single-input"
          placeholder="Escribe tu respuesta aquí..."
          {...register("choice")}
        />
        {errors.choice && (
          <p className="text-sm text-destructive">{errors.choice.message}</p>
        )}
      </div>
      <Button type="submit" disabled={setAnswerMutation.isLoading} className="w-full">
        {setAnswerMutation.isLoading ? "Guardando..." : "Guardar respuesta"}
      </Button>
    </form>
  )
}
