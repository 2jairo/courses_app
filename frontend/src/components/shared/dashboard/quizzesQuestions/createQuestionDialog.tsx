import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { createQuizQuestionFormSchemaWithOptions, getDefaultQuizQuestionFormValues, quizQuestionKindOptions, quizQuestionStatusOptions, type CreateQuizQuestionWithOptionsFormSchema } from "./createQuestionFormSchemas"
import type { QuizQuestionKind, QuizQuestionStatus } from "@/types/common/quizzesQuestions"
import { useCreateQuestionMutation } from "@/mutations/dashboard/quizzesQuestions/useCreateQuestionMutation"
import { useUpdateQuestionMutation } from "@/mutations/dashboard/quizzesQuestions/useUpdateQuestionMutation"
import { TextMultipleForm } from "./createQuestionKindForms/textMultipleForm"
import { TextSingleForm } from "./createQuestionKindForms/textSingleForm"
import { MatchForm } from "./createQuestionKindForms/matchForm"
import { OrderingForm } from "./createQuestionKindForms/orderingForm"
import { cn } from "@/lib/utils"
import { QuizQuestionKindBadge } from "../../quizzesQuestionsUtils/quizQuestionKind"
import { BoolMultipleForm } from "./createQuestionKindForms/boolMultipleForm"
import { BoolSingleForm } from "./createQuestionKindForms/boolSingleForm"
import type { ExtendedQuizResponseQuestion } from "@/types/dashboard/quizzes"

interface CreateQuestionDialogProps {
  courseId: number
  quizId: number
  questionId?: number
  initialData?: ExtendedQuizResponseQuestion | null
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function CreateQuestionDialog({
  courseId,
  quizId,
  questionId,
  isOpen: controlledIsOpen,
  onOpenChange,
  initialData,
  trigger,
  onSuccess,
}: CreateQuestionDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

  const createQuestionMutation = useCreateQuestionMutation()
  const updateQuestionMutation = useUpdateQuestionMutation()

  const isSubmitting = createQuestionMutation.isLoading || updateQuestionMutation.isLoading
  const isUpdating = !!questionId

  const selectedKind = (initialData?.kind || "BoolSingle") as QuizQuestionKind
  const [kind, setKind] = useState<QuizQuestionKind>(selectedKind)

  const methods = useForm<CreateQuizQuestionWithOptionsFormSchema>({
    resolver: zodResolver(createQuizQuestionFormSchemaWithOptions),
    defaultValues: initialData
      ? getDefaultQuizQuestionFormValues(initialData.kind, initialData)
      : getDefaultQuizQuestionFormValues(kind),
    mode: "onChange",
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = methods

  useEffect(() => {
    methods.trigger() // Validate all fields on mount
  }, [methods, kind])

  const watchedKind = watch("kind")

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledIsOpen !== undefined) {
      onOpenChange?.(newOpen)
    } else {
      setInternalIsOpen(newOpen)
    }
  }

  const handleKindChange = (newKind: QuizQuestionKind) => {
    setKind(newKind)
    const { kind, options } = getDefaultQuizQuestionFormValues(newKind, initialData!)
    reset({ ...methods.getValues(), kind, options } as CreateQuizQuestionWithOptionsFormSchema)
  }

  const handleSubmitInternal = (data: CreateQuizQuestionWithOptionsFormSchema) => {
    if (isUpdating && questionId) {
      updateQuestionMutation.mutate(
        {
          payload: {
            ...data,
            questionId,
          },
          courseId,
          quizId,
        },
        {
          onSuccess: () => {
            handleOpenChange(false)
            onSuccess?.()
          },
        }
      )
    } else {
      createQuestionMutation.mutate(
        {
          payload: {
            ...data,
            quizId,
          },
          courseId,
          quizId,
        },
        {
          onSuccess: () => {
            handleOpenChange(false)
            onSuccess?.()
          },
        }
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva pregunta
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="flex max-h-screen flex-col max-w-350!">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            {isUpdating ? "Editar pregunta" : "Crear nueva pregunta"}
            <QuizQuestionKindBadge kind={watchedKind}/>
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleSubmitInternal)} className="w-full flex-1 overflow-hidden flex flex-col">
            <div className="min-w-0 overflow-auto flex flex-col lg:flex-row gap-6 p-6">
              {/* First Column: Basic Fields and Question Kind Selector */}
              <div className="space-y-6 flex-1">
                <Field>
                  <FieldLabel htmlFor="questionText">Texto de la pregunta</FieldLabel>
                  <FieldContent>
                    <Textarea
                      id="questionText"
                      placeholder="Escribe la pregunta..."
                      rows={4}
                      {...register("questionText")}
                      disabled={isSubmitting}
                    />
                    <FieldDescription>Asegúrate de que la pregunta sea clara y específica</FieldDescription>
                    {errors.questionText && <FieldError>{errors.questionText.message}</FieldError>}
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="explanation">Explicación (opcional)</FieldLabel>
                  <FieldContent>
                    <Textarea
                      id="explanation"
                      placeholder="Proporciona una explicación para ayudar a los estudiantes a entender la respuesta correcta..."
                      rows={3}
                      {...register("explanation")}
                      disabled={isSubmitting}
                    />
                    <FieldDescription>Esta explicación se mostrará después de que el estudiante responda</FieldDescription>
                    {errors.explanation && <FieldError>{errors.explanation.message}</FieldError>}
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Estado</FieldLabel>
                  <FieldContent>
                    <Select
                      value={watch("status")}
                      onValueChange={(value) => setValue("status", value as QuizQuestionStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {quizQuestionStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.status && <FieldError>{errors.status.message}</FieldError>}
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="points">Puntos</FieldLabel>
                  <FieldContent>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      max="1000"
                      {...register("points", { valueAsNumber: true })}
                      disabled={isSubmitting}
                    />
                    <FieldDescription>Puntos que otorgará esta pregunta</FieldDescription>
                    {errors.points && <FieldError>{errors.points.message}</FieldError>}
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Tipo de pregunta</FieldLabel>
                  <FieldContent>
                    <div className="grid grid-cols-3 gap-4">
                      {quizQuestionKindOptions.map((option) => (
                        <Card
                          key={option.value}
                          className={cn(
                            "cursor-pointer transition-colors border-2 p-0",
                            watchedKind === option.value ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
                          )}
                          onClick={() => handleKindChange(option.value)}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-2">
                              <h4 className={cn("font-medium", watchedKind === option.value ? "text-primary" : "text-foreground")}>
                                {option.label}
                              </h4>
                              <p className="text-sm text-muted-foreground">{option.desc}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {errors.kind && <FieldError>{errors.kind.message}</FieldError>}
                  </FieldContent>
                </Field>
              </div>

              {/* Second Column: Question Kind Options */}
              <div className="space-y-6 flex-1">
                {watchedKind === "BoolMultiple" && <BoolMultipleForm />}
                {watchedKind === "BoolSingle" && <BoolSingleForm />}
                {watchedKind === "TextMultiple" && <TextMultipleForm />}
                {watchedKind === "TextSingle" && <TextSingleForm />}
                {watchedKind === "Match" && <MatchForm />}
                {watchedKind === "Ordering" && <OrderingForm />}
              </div>
            </div>

            {/* Footer with Action Buttons */}
            <div className="w-full py-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !isValid}>
                {isSubmitting ? "Guardando..." : isUpdating ? "Actualizar pregunta" : "Crear pregunta"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

