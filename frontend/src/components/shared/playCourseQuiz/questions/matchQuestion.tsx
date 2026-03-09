import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { StartQuizAttemptResponseQuestion } from "@/types/client/quizzes"
import {
  playQuizQuestionMatchFormSchema,
  type PlayQuizQuestionMatchFormSchema,
} from "../playQuizQuestionFormSchemas"

interface MatchQuestionProps {
  question: StartQuizAttemptResponseQuestion & { kind: "Match" }
  formRef: React.RefObject<HTMLFormElement | null>
  onSubmit: (values: PlayQuizQuestionMatchFormSchema) => void
  onInvalidSubmit?: () => void
}

export function MatchQuestion({ question, formRef, onSubmit, onInvalidSubmit }: MatchQuestionProps) {
  const defaultChoices = question.options.keys.map((key) => ({
    keyId: key.id,
    valueId: question.answer?.choices.find((c) => c.keyId === key.id)?.valueId ?? "",
  }))

  const { control, handleSubmit, formState: { errors } } = useForm<PlayQuizQuestionMatchFormSchema>({
    resolver: zodResolver(playQuizQuestionMatchFormSchema),
    defaultValues: { choices: defaultChoices },
  })

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Relaciona cada elemento de la izquierda con su par de la derecha.
      </p>
      <div className="space-y-3">
        {question.options.keys.map((key, i) => (
          <div key={key.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm font-medium">
              {key.value}
            </div>
            <span className="text-muted-foreground text-lg">→</span>
            <div className="space-y-1">
              <Controller
                control={control}
                name={`choices.${i}.valueId`}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {question.options.values.map((val) => (
                        <SelectItem key={val.id} value={val.id}>
                          {val.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.choices?.[i]?.valueId?.message && (
                <p className="text-xs text-destructive">{errors.choices?.[i]?.valueId?.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </form>
  )
}
