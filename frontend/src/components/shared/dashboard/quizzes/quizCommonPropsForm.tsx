import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Field, FieldLabel, FieldContent, FieldTitle, FieldDescription, FieldError } from "@/components/ui/field"
import type { QuizResponseExtended, UpdateQuizRequest } from "@/types/dashboard/quizzes"
import { useUpdateQuizMutation } from "@/mutations/dashboard/quizzes/useUpdateQuizMutation"
import { toast } from "sonner"
import { DCP } from "@/lib/dashboardCoursePermissions"
import type { CourseResponseExtended } from "@/types/dashboard/courses"
import { createQuizFormSchema, type CreateQuizFormSchema } from "./createQuizFormSchema"


interface QuizCommonPropsFormProps {
  quiz: QuizResponseExtended
  course: CourseResponseExtended
}

export function QuizCommonPropsForm({ quiz, course }: QuizCommonPropsFormProps) {
  const updateQuizMutation = useUpdateQuizMutation()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CreateQuizFormSchema>({
    resolver: zodResolver(createQuizFormSchema),
    defaultValues: {
      title: quiz.title,
      timeLimitMinutes: quiz.timeLimitSecs ? Math.round(quiz.timeLimitSecs / 60 * 100) / 100 : undefined,
      passingScorePercentage: quiz.passingScorePercentage,
      shuffleQuestions: quiz.shuffleQuestions,
      showCorrectAnswers: quiz.showCorrectAnswers,
    },
  })

  useEffect(() => {
    if(isDirty) {
      return
    }

    reset({
      title: quiz.title,
      timeLimitMinutes: quiz.timeLimitSecs ? Math.round(quiz.timeLimitSecs / 60 * 100) / 100 : undefined,
      passingScorePercentage: quiz.passingScorePercentage,
      shuffleQuestions: quiz.shuffleQuestions,
      showCorrectAnswers: quiz.showCorrectAnswers,
    })
  }, [quiz])

  const onSubmit = (data: CreateQuizFormSchema) => {
    const payload: UpdateQuizRequest = {
      quizId: quiz.id,
    }

    const quizTimeLimitInMunutes = quiz.timeLimitSecs ? Math.round(quiz.timeLimitSecs / 60 * 100) / 100 : undefined
    if (data.timeLimitMinutes !== quizTimeLimitInMunutes) {
      payload.timeLimitSecs = Math.round(data.timeLimitMinutes * 60)
    }
    if (data.title !== quiz.title) {
      payload.title = data.title
    }
    if (data.passingScorePercentage !== quiz.passingScorePercentage) {
      payload.passingScorePercentage = data.passingScorePercentage
    }
    if (data.shuffleQuestions !== quiz.shuffleQuestions) {
      payload.shuffleQuestions = data.shuffleQuestions
    }
    if (data.showCorrectAnswers !== quiz.showCorrectAnswers) {
      payload.showCorrectAnswers = data.showCorrectAnswers
    }

    updateQuizMutation.mutate(
      {
        payload,
        courseId: course.id,
      },
      {
        onSuccess: () => {
          toast.success("Quiz updated successfully")
        },
      }
    )
  }

  const handleCancel = () => {
    reset()
  }

  const shuffleQuestions = watch("shuffleQuestions")
  const showCorrectAnswers = watch("showCorrectAnswers")
  const editQuizDisabled = !DCP.canModifyQuizzes(course.role)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      <Link
        to={`/dashboard/courses/${course.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al curso {course.title}
      </Link>

      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Propiedades básicas</h1>
          <p className="text-sm text-muted-foreground">
            Actualiza las propiedades comunes del cuestionario.
          </p>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button 
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateQuizMutation.isLoading || !isDirty}
          >
            Cancelar
          </Button>

          <Button 
            type="submit" 
            disabled={!isDirty || updateQuizMutation.isLoading || editQuizDisabled}
          >
            {updateQuizMutation.isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        <Field>
          <FieldLabel>Título</FieldLabel>
          <FieldContent>
            <Input {...register("title")} disabled={editQuizDisabled} />
            <FieldError errors={[errors.title]} />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel>Límite de tiempo (minutos)</FieldLabel>
            <FieldContent>
              <Input
                type="number"
                {...register("timeLimitMinutes", { valueAsNumber: true })}
                disabled={editQuizDisabled}
              />
              <FieldDescription>
                Tiempo máximo en minutos para completar el cuestionario. Usa 0 para sin límite.
              </FieldDescription>
              <FieldError errors={[errors.timeLimitMinutes]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Porcentaje mínimo para aprobar</FieldLabel>
            <FieldContent>
              <Input
                type="number"
                {...register("passingScorePercentage", { valueAsNumber: true })}
                disabled={editQuizDisabled}
              />
              <FieldDescription>
                Porcentaje mínimo de respuestas correctas para aprobar.
              </FieldDescription>
              <FieldError errors={[errors.passingScorePercentage]} />
            </FieldContent>
          </Field>
        </div>

        <div className="flex flex-col gap-4">
          <Field orientation="horizontal" className="justify-between">
            <FieldContent>
              <FieldTitle>Mezclar preguntas</FieldTitle>
              <FieldDescription>Las preguntas se mostrarán en un orden aleatorio para cada intento.</FieldDescription>
            </FieldContent>
            <Switch
              checked={shuffleQuestions}
              onCheckedChange={(val) => setValue("shuffleQuestions", val, { shouldDirty: true })}
              disabled={editQuizDisabled}
            />
          </Field>

          <Field orientation="horizontal" className="justify-between">
            <FieldContent>
              <FieldTitle>Mostrar respuestas correctas</FieldTitle>
              <FieldDescription>Los estudiantes podrán ver las respuestas correctas después de completar el cuestionario.</FieldDescription>
            </FieldContent>
            <Switch
              checked={showCorrectAnswers}
              onCheckedChange={(val) => setValue("showCorrectAnswers", val, { shouldDirty: true })}
              disabled={editQuizDisabled}
            />
          </Field>
        </div>
      </div>
    </form>
  )
}

