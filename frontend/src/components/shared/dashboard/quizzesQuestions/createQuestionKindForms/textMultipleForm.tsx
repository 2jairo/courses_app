import { useFormContext, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { QuizQuestionTextMultipleFormSchema } from "../createQuestionFormSchemas"

export function TextMultipleForm() {
  const { control, register, trigger, formState: { errors } } = useFormContext<QuizQuestionTextMultipleFormSchema>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options.keywords"
  })

  const addKeyword = () => {
    append({ value: "" })
  }

  const removeKeyword = (index: number) => {
    remove(index)
  }

  const globalErrMsg = errors.options?.keywords?.root?.message || errors.options?.keywords?.message

  return (
    <Field>
      <FieldLabel>Palabras clave válidas</FieldLabel>
      <FieldContent>
        <div className="space-y-2">
          {fields.map((field, index) => {
            const keywordError = errors.options?.keywords?.[index]?.value?.message
            return (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  placeholder={`Palabra clave ${index + 1}`}
                  {...register(`options.keywords.${index}.value`, { onChange: () => trigger("options.keywords") })}
                />
                {keywordError && (
                  <p className="text-destructive text-xs mt-1">{keywordError}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeKeyword(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            )
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addKeyword}
          className={cn(fields.length ? 'mt-3' : '')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar palabra clave
        </Button>

        <FieldDescription className="mt-2">
          Cualquiera de estas palabras clave será aceptada como respuesta correcta. Añade al menos 1.
        </FieldDescription>

        {globalErrMsg && (
          <FieldError>{globalErrMsg}</FieldError>
        )}
      </FieldContent>
    </Field>
  )
}
