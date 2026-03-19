import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
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
import { Switch } from "@/components/ui/switch"
import { useCreateQuizMutation } from "@/mutations/dashboard/quizzes/useCreateQuizMutation"
import { createQuizFormSchema, type CreateQuizFormSchema } from "./createQuizFormSchema"
import type { CoursePermissionsRole } from "@/types/common/coursePermissions"
import { DCP } from "@/lib/dashboardCoursePermissions"

interface CreateQuizDialogProps {
  courseId: number
  currentUserPermission: CoursePermissionsRole
}

export function CreateQuizDialog({ courseId, currentUserPermission }: CreateQuizDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const createQuizMutation = useCreateQuizMutation()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateQuizFormSchema>({
    resolver: zodResolver(createQuizFormSchema),
    defaultValues: {
      title: "",
      timeLimitMinutes: 0,
      passingScorePercentage: 60,
      shuffleQuestions: false,
      showCorrectAnswers: true,
    },
    mode: "onBlur",
  })

  const onSubmit = (values: CreateQuizFormSchema) => {
    createQuizMutation.mutate({
      payload: {
        courseId,
        timeLimitSecs: values.timeLimitMinutes === 0 ? null : values.timeLimitMinutes * 60,
        passingScorePercentage: values.passingScorePercentage,
        shuffleQuestions: values.shuffleQuestions,
        showCorrectAnswers: values.showCorrectAnswers,
        title: values.title
      },
    })

    reset()
    setIsOpen(false)
  }

  const handleClose = () => {
    reset()
    setIsOpen(false)
  }

  const isDisabled = createQuizMutation.isLoading || !DCP.canModifyQuizzes(currentUserPermission)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={isDisabled} onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo cuestionario
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear nuevo cuestionario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="title">Título del cuestionario</FieldLabel>
            <FieldContent>
              <Input
                id="title"
                type="text"
                {...register("title")}
                disabled={isSubmitting}
              />
              {errors.title && <FieldError>{errors.title.message}</FieldError>}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="timeLimitMinutes">Límite de tiempo (minutos)</FieldLabel>
            <FieldContent>
              <Input
                id="timeLimitMinutes"
                type="number"
                placeholder="0"
                {...register("timeLimitMinutes", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              <FieldDescription>
                Tiempo máximo en minutos para completar el cuestionario. Usa 0 para sin límite.
              </FieldDescription>
              {errors.timeLimitMinutes && <FieldError>{errors.timeLimitMinutes.message}</FieldError>}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="passingScorePercentage">Porcentaje mínimo para aprobar</FieldLabel>
            <FieldContent>
              <Input
                id="passingScorePercentage"
                type="number"
                placeholder="60"
                {...register("passingScorePercentage", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              <FieldDescription>
                Porcentaje mínimo de respuestas correctas para aprobar.
              </FieldDescription>
              {errors.passingScorePercentage && <FieldError>{errors.passingScorePercentage.message}</FieldError>}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="shuffleQuestions">Mezclar preguntas</FieldLabel>
            <FieldContent>
              <Controller
                name="shuffleQuestions"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="shuffleQuestions"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
              <FieldDescription>
                Las preguntas se mostrarán en un orden aleatorio para cada intento.
              </FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="showCorrectAnswers">Mostrar respuestas correctas</FieldLabel>
            <FieldContent>
              <Controller
                name="showCorrectAnswers"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="showCorrectAnswers"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
              <FieldDescription>
                Los estudiantes podrán ver las respuestas correctas después de completar el cuestionario.
              </FieldDescription>
            </FieldContent>
          </Field>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Crear cuestionario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
