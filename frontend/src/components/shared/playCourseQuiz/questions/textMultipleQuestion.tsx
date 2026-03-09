import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
import type { StartQuizAttemptResponseQuestion } from "@/types/client/quizzes"
import {
  buildPlayQuizQuestionTextMultipleFormSchema,
  type PlayQuizQuestionTextMultipleFormSchema,
} from "../playQuizQuestionFormSchemas"

interface TextMultipleQuestionProps {
  question: StartQuizAttemptResponseQuestion & { kind: "TextMultiple" }
  formRef: React.RefObject<HTMLFormElement | null>
  onSubmit: (values: PlayQuizQuestionTextMultipleFormSchema) => void
  onInvalidSubmit?: () => void
}

export function TextMultipleQuestion({ question, formRef, onSubmit, onInvalidSubmit }: TextMultipleQuestionProps) {
  const total = question.options.totalKeywords

  const { register, handleSubmit, formState: { errors } } = useForm<PlayQuizQuestionTextMultipleFormSchema>({
    resolver: zodResolver(buildPlayQuizQuestionTextMultipleFormSchema(total)),
    defaultValues: {
      choices: question.answer?.choices ?? Array(total).fill(""),
    },
  })

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ingresa {total} palabra(s) clave relacionada(s) al tema.
      </p>
      <div className="space-y-3">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Input
              placeholder={`Palabra clave ${i + 1}`}
              {...register(`choices.${i}`)}
            />
            {errors.choices?.[i] && (
              <p className="text-sm text-destructive">{errors.choices[i]?.message}</p>
            )}
          </div>
        ))}
      </div>
      {(errors.choices as { message?: string } | undefined)?.message && (
        <p className="text-sm text-destructive">
          {(errors.choices as { message?: string }).message}
        </p>
      )}
    </form>
  )
}
