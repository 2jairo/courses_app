import { useForm, Controller, type ControllerRenderProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { StartQuizAttemptResponseQuestion } from "@/types/client/quizzes"
import {
  playQuizQuestionBoolMultipleFormSchema,
  type PlayQuizQuestionBoolMultipleFormSchema,
} from "../playQuizQuestionFormSchemas"

interface BoolMultipleQuestionProps {
  question: StartQuizAttemptResponseQuestion & { kind: "BoolMultiple" }
  formRef: React.RefObject<HTMLFormElement | null>
  onSubmit: (values: PlayQuizQuestionBoolMultipleFormSchema) => void
  onInvalidSubmit?: () => void
}

export function BoolMultipleQuestion({ question, formRef, onSubmit, onInvalidSubmit }: BoolMultipleQuestionProps) {

  const { control, handleSubmit, formState: { errors }, watch } = useForm<PlayQuizQuestionBoolMultipleFormSchema>({
    resolver: zodResolver(playQuizQuestionBoolMultipleFormSchema),
    defaultValues: {
      choicesId: question.answer?.choicesId ?? [],
    },
  })

  const selected = watch("choicesId")

  const onCheckedChange = (
    isChecked: boolean | "indeterminate",
    field: ControllerRenderProps<{choicesId: string[]}, "choicesId">,
    choiceId: string
  ) => {
    const next = isChecked
      ? [...field.value, choiceId]
      : field.value.filter((id) => id !== choiceId)
    field.onChange(next)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-4">
      <Controller
        control={control}
        name="choicesId"
        render={({ field }) => (
          <div className="space-y-2">
            {question.options.choices.map((choice) => {
              const checked = field.value.includes(choice.id)
              
              return (
                <Label 
                  key={choice.id} 
                  htmlFor={`bool-multi-${choice.id}`} 
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer data-[checked=true]:border-primary data-[checked=true]:bg-primary/5"
                  data-checked={checked}
                >
                  <Checkbox
                    id={`bool-multi-${choice.id}`}
                    checked={checked}
                    onCheckedChange={(isCheked) => onCheckedChange(isCheked, field, choice.id)}
                  />
                  {choice.text}
                </Label>   
              )
            })}
          </div>
        )}
      />
      {errors.choicesId && (
        <p className="text-sm text-destructive">{errors.choicesId.message}</p>
      )}
      <p className="text-xs text-muted-foreground">{selected.length} opción(es) seleccionada(s)</p>
    </form>
  )
}
