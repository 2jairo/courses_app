import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import type { QuizQuestionTextSingleFormSchema } from "../createQuestionFormSchemas"

export function TextSingleForm() {
  const { register, formState: { errors } } = useFormContext<QuizQuestionTextSingleFormSchema>()

  return (
    <Field>
      <FieldLabel htmlFor="correctAnswer">Respuesta correcta</FieldLabel>
      <FieldContent>
        <Input
          id="correctAnswer"
          placeholder="Escribe la respuesta correcta exacta..."
          {...register("options.correctAnswer")}
        />
        <FieldDescription>
          La respuesta debe coincidir exactamente (sensible a mayúsculas/minúsculas)
        </FieldDescription>
        
        {errors.options?.correctAnswer && <FieldError>{errors.options.correctAnswer.message}</FieldError>}
      </FieldContent>
    </Field>
  )
}
