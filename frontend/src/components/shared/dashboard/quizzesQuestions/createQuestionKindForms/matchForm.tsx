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
import type { QuizQuestionMatchFormSchema } from "../createQuestionFormSchemas"

export function MatchForm() {
  const { control, register, formState: { errors }, trigger } = useFormContext<QuizQuestionMatchFormSchema>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options.pairs"
  })

  const addPair = () => {
    append({ key: "", value: "" })
  }

  const removePair = (index: number) => {
    remove(index)
  }

  const globalErrMsg = errors.options?.pairs?.root?.message || errors.options?.pairs?.message

  return (
    <Field>
      <FieldLabel>Pares para emparejar</FieldLabel>
      <FieldContent>
        <div className="space-y-3">
          {fields.map((field, index) => {
            const keyError = errors.options?.pairs?.[index]?.key?.message
            const valueError = errors.options?.pairs?.[index]?.value?.message

            return (
              <div
                key={field.id}
                className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30"
              >
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Izquierda</label>
                  <Input
                    placeholder={`Elemento ${index + 1}`}
                    {...register(`options.pairs.${index}.key`, { onChange: () => trigger("options.pairs") })}
                  />
                  {keyError && (
                    <p className="text-destructive text-xs mt-1">{keyError}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Derecha</label>
                  <Input
                    placeholder={`Elemento ${index + 1}`}
                    {...register(`options.pairs.${index}.value`, { onChange: () => trigger("options.pairs") })}
                  />
                  {valueError && (
                    <p className="text-destructive text-xs mt-1">{valueError}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-6"
                  onClick={() => removePair(index)}
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
          onClick={addPair}
          className={cn(fields.length ? 'mt-3' : '')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar par
        </Button>

        <FieldDescription className="mt-2">
          Crea pares de elementos que los estudiantes deben emparejar. Añade al menos 2 pares.
        </FieldDescription>

        {globalErrMsg && (
          <FieldError>{globalErrMsg}</FieldError>
        )}
      </FieldContent>
    </Field>
  )
}
