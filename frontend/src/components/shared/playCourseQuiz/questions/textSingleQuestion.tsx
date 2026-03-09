import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { StartQuizAttemptResponseQuestion } from "@/types/client/quizzes"
import { playQuizQuestionTextSingleFormSchema, type PlayQuizQuestionTextSingleFormSchema } from "../playQuizQuestionFormSchemas"

interface TextSingleQuestionProps {
  question: StartQuizAttemptResponseQuestion & { kind: "TextSingle" }
  formRef: React.RefObject<HTMLFormElement | null>
  onSubmit: (values: PlayQuizQuestionTextSingleFormSchema) => void
  onInvalidSubmit?: () => void
}

export function TextSingleQuestion({ question, formRef, onSubmit, onInvalidSubmit }: TextSingleQuestionProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<PlayQuizQuestionTextSingleFormSchema>({
    resolver: zodResolver(playQuizQuestionTextSingleFormSchema),
    defaultValues: {
      choice: question.answer?.choice ?? "",
    },
  })

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-4">
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
    </form>
  )
}
