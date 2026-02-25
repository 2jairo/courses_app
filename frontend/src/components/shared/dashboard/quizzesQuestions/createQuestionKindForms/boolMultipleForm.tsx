import { useFormContext, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { QuizQuestionBoolMultipleFormSchema } from "../createQuestionFormSchemas"

export function BoolMultipleForm() {
  const { control, register, formState: { errors }, watch, trigger } = useFormContext<QuizQuestionBoolMultipleFormSchema>()
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "options.choices",
  })
  const choices = watch("options.choices")

  const addChoice = () => {
    append({ text: "", correct: false })
  }

  const updateChecked = (index: number, value: boolean) => {
    const choice = choices[index]
    if (!choice) return

    update(index, { ...choice, correct: value })
  }

  const removeChoice = (index: number) => {
    remove(index)
  }

  const globalErrMsg = errors.options?.choices?.root?.message || errors.options?.choices?.message
  
  return (
    <Field>
      <FieldLabel>Opciones</FieldLabel>
      <FieldContent>
        {fields.length > 0 && choices && (
          <div className="space-y-3">
            {fields.map((field, index) => {
              const textError = errors.options?.choices?.[index]?.text?.message
              return (
              <div key={field.id} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30">
                <div className="flex-1">
                  <Input
                    placeholder={`Opción ${index + 1}`}
                    {...register(`options.choices.${index}.text`, { onChange: () => trigger("options.choices") })}
                  />
                  {textError && (
                    <p className="text-destructive text-xs mt-1">{textError}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={choices[index]?.correct || false}
                    onCheckedChange={(checked) => updateChecked(index, Boolean(checked))}
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Correcta</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeChoice(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )})
            }
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addChoice}
          className={cn(fields.length ? 'mt-3' : '')}
        >
          <Plus className="h-4 w-4" />
          Agregar opción
        </Button>

        <FieldDescription className="mt-2">
          Añade al menos 2 opciones. Marca las respuestas correctas.
        </FieldDescription>

        {globalErrMsg && (
          <FieldError>{globalErrMsg}</FieldError>
        )}
      </FieldContent>
    </Field>
  )
}
