import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { StartQuizAttemptResponseQuestion } from "@/types/client/quizzes"
import {
  playQuizQuestionBoolSingleFormSchema,
  type PlayQuizQuestionBoolSingleFormSchema,
} from "../playQuizQuestionFormSchemas"

interface BoolSingleQuestionProps {
  question: StartQuizAttemptResponseQuestion & { kind: "BoolSingle" }
  formRef: React.RefObject<HTMLFormElement | null>
  onSubmit: (values: PlayQuizQuestionBoolSingleFormSchema) => void
  onInvalidSubmit?: () => void
}

export function BoolSingleQuestion({ question, formRef, onSubmit, onInvalidSubmit }: BoolSingleQuestionProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<PlayQuizQuestionBoolSingleFormSchema>({
    resolver: zodResolver(playQuizQuestionBoolSingleFormSchema),
    defaultValues: {
      choiceId: question.answer?.choiceId ?? "",
    },
  })

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-4">
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
    </form>
  )
}
