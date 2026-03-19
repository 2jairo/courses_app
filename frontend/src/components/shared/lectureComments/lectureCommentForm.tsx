import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { lectureCommentFormSchema, type LectureCommentFormSchema } from "./lectureCommentFormSchema"

interface LectureCommentFormProps {
  initialValues?: LectureCommentFormSchema
  onSubmit: (values: LectureCommentFormSchema) => Promise<void> | void
  onCancel?: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function LectureCommentForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Comentar"
}: LectureCommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LectureCommentFormSchema>({
    resolver: zodResolver(lectureCommentFormSchema),
    defaultValues: initialValues || { body: "" },
    mode: "onBlur",
  })
  
  const onSubmitHandler = async (values: LectureCommentFormSchema) => {
    await onSubmit(values)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-2">
      <Field>
        <FieldContent>
          <div className={`relative rounded-md border shadow-sm focus-within:ring-1 focus-within:ring-ring bg-background ${isSubmitting ? "opacity-50" : ""}`}>
            <Textarea 
              placeholder="Escribe un comentario..." 
              className="resize-none min-h-30 border-0 focus-visible:ring-0 shadow-none pb-12 bg-transparent"
              aria-invalid={!!errors.body}
              {...register("body")} 
              disabled={isSubmitting} 
            />
            
            <div className="absolute bottom-2 right-2 flex items-center justify-end gap-2">
              {onCancel && (
                <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {submitLabel}
              </Button>
            </div>
          </div>
          <FieldError errors={[errors.body]} className="text-red-500" />
        </FieldContent>
      </Field>
    </form>
  )
}
