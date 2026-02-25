import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useSetAnswerMutation } from "@/mutations/client/quizzes/useSetAnswerMutation"
import type { StartQuizAttemptResponseQuestion } from "@/types/client/quizzes"
import {
  playQuizQuestionBoolMultipleFormSchema,
  type PlayQuizQuestionBoolMultipleFormSchema,
} from "../playQuizQuestionFormSchemas"

interface BoolMultipleQuestionProps {
  question: StartQuizAttemptResponseQuestion & { kind: "BoolMultiple" }
  lectureSlug: string
  onAnswered: () => void
}

export function BoolMultipleQuestion({ question, lectureSlug, onAnswered }: BoolMultipleQuestionProps) {
  const setAnswerMutation = useSetAnswerMutation()

  const { control, handleSubmit, formState: { errors }, watch } = useForm<PlayQuizQuestionBoolMultipleFormSchema>({
    resolver: zodResolver(playQuizQuestionBoolMultipleFormSchema),
    defaultValues: {
      choicesId: question.answer?.choicesId ?? [],
    },
  })

  const selected = watch("choicesId")

  const onSubmit = (values: PlayQuizQuestionBoolMultipleFormSchema) => {
    setAnswerMutation.mutate(
      { lectureSlug, questionId: question.id, kind: "BoolMultiple", answer: values },
      { onSuccess: onAnswered }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        control={control}
        name="choicesId"
        render={({ field }) => (
          <div className="space-y-2">
            {question.options.choices.map((choice) => {
              const checked = field.value.includes(choice.id)
              return (
                <div
                  key={choice.id}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer data-[checked=true]:border-primary data-[checked=true]:bg-primary/5"
                  data-checked={checked}
                >
                  <Checkbox
                    id={`bool-multi-${choice.id}`}
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      const next = isChecked
                        ? [...field.value, choice.id]
                        : field.value.filter((id) => id !== choice.id)
                      field.onChange(next)
                    }}
                  />
                  <Label htmlFor={`bool-multi-${choice.id}`} className="cursor-pointer flex-1 font-normal">
                    {choice.text}
                  </Label>
                </div>
              )
            })}
          </div>
        )}
      />
      {errors.choicesId && (
        <p className="text-sm text-destructive">{errors.choicesId.message}</p>
      )}
      <p className="text-xs text-muted-foreground">{selected.length} opción(es) seleccionada(s)</p>
      <Button type="submit" disabled={setAnswerMutation.isLoading} className="w-full">
        {setAnswerMutation.isLoading ? "Guardando..." : "Guardar respuesta"}
      </Button>
    </form>
  )
}
