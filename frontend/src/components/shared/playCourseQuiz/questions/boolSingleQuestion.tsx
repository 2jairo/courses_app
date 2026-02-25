import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useSetAnswerMutation } from "@/mutations/client/quizzes/useSetAnswerMutation"
import type { StartQuizAttemptResponseQuestion } from "@/types/client/quizzes"
import {
  playQuizQuestionBoolSingleFormSchema,
  type PlayQuizQuestionBoolSingleFormSchema,
} from "../playQuizQuestionFormSchemas"

interface BoolSingleQuestionProps {
  question: StartQuizAttemptResponseQuestion & { kind: "BoolSingle" }
  lectureSlug: string
  onAnswered: () => void
}

export function BoolSingleQuestion({ question, lectureSlug, onAnswered }: BoolSingleQuestionProps) {
  const setAnswerMutation = useSetAnswerMutation()

  const { control, handleSubmit, formState: { errors } } = useForm<PlayQuizQuestionBoolSingleFormSchema>({
    resolver: zodResolver(playQuizQuestionBoolSingleFormSchema),
    defaultValues: {
      choiceId: question.answer?.choiceId ?? "",
    },
  })

  const onSubmit = (values: PlayQuizQuestionBoolSingleFormSchema) => {
    setAnswerMutation.mutate(
      { lectureSlug, questionId: question.id, kind: "BoolSingle", answer: values },
      { onSuccess: onAnswered }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        control={control}
        name="choiceId"
        render={({ field }) => (
          <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-2">
            {question.options.choices.map((choice) => (
              <div key={choice.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer has-checked:border-primary has-checked:bg-primary/5">
                <Label className="cursor-pointer flex-1 font-normal">
                  <RadioGroupItem value={choice.id} />
                  {choice.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      />

      {errors.choiceId && (
        <p className="text-sm text-destructive">{errors.choiceId.message}</p>
      )}

      <Button type="submit" disabled={setAnswerMutation.isLoading} className="w-full">
        {setAnswerMutation.isLoading ? "Guardando..." : "Guardar respuesta"}
      </Button>
    </form>
  )
}
