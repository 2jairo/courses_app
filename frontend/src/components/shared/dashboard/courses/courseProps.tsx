import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { CourseResponseExtended, CourseVisibility } from "@/types/courses"
import { useUpdateCourseMutation } from "@/mutations/dashboard/courses/useUpdateCourseMutation"
import { modifyCoursePropsSchema, type ModifyCoursePropsSchema } from "./coursePropsSchema"
import { zodResolver } from "@hookform/resolvers/zod"

interface ModifyCoursePropsProps {
  course: CourseResponseExtended
}
export function CourseProps({ course }: ModifyCoursePropsProps) {
  const updateMutation = useUpdateCourseMutation()
  const [hasChanged, setHasChanged] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState
  } = useForm<ModifyCoursePropsSchema>({
    resolver: zodResolver(modifyCoursePropsSchema),
    defaultValues: {
      title: course.title,
      description: course.description,
      poster: course.poster ?? "",
      visibility: course.visibility,
    },
  })

  const formValues = watch()

  useEffect(() => {
    setHasChanged(
      formValues.title !== course.title ||
      formValues.description !== course.description ||
      formValues.poster !== (course.poster || '') ||
      formValues.visibility !== course.visibility
    )
  }, [formValues, course])

  const onSubmitEdit = (formValues: ModifyCoursePropsSchema) => {
    const values: ModifyCoursePropsSchema = {}
    if(formValues.title !== course.title) {
      values.title = formValues.title
    }
    if(formValues.description !== course.description) {
      values.description = formValues.description
    }
    if(formValues.poster !== (course.poster ?? "")) {
      values.poster = formValues.poster
    }
    if(formValues.visibility !== course.visibility) {
      values.visibility = formValues.visibility
    }

    updateMutation.mutate(
      {
        ...values,
        courseId: course.id,
      },
      {
        onSuccess: () => {
          toast.success("Curso actualizado correctamente")
          setHasChanged(false)
        }
      }
    )
  }

  const handleCancel = () => {
    reset()
    setHasChanged(false)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmitEdit)}>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Propiedades básicas</h1>
          <p className="text-sm text-muted-foreground">
            Modifica las propiedades básicas del curso
          </p>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateMutation.isLoading || !hasChanged}
          >
            Cancelar
          </Button>

          <Button type="submit" disabled={updateMutation.isLoading || !hasChanged}>
            {updateMutation.isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </header>

      <section className="space-y-4">
        <Field>
          <FieldLabel htmlFor="title">Título</FieldLabel>
          <FieldContent>
            <Input id="title" {...register("title", { required: true })} />
            <FieldError errors={[formState.errors.title]}/>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Descripción</FieldLabel>
          <FieldContent>
            <Textarea
              id="description"
              rows={3}
              {...register("description", { required: true })}
            />
            <FieldError errors={[formState.errors.description]}/>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="poster">URL de la imagen</FieldLabel>
          <FieldContent>
            <Input
              id="poster"
              type="url"
              placeholder="https://..."
              {...register("poster")}
            />
            <FieldError errors={[formState.errors.poster]}/>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="visibility">Visibilidad</FieldLabel>
          <FieldContent>
            <Select
              value={formValues.visibility}
              onValueChange={(value) =>
                setValue("visibility", value as CourseVisibility)
              }
            >
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Private">Privado</SelectItem>
                <SelectItem value="Link">Con enlace</SelectItem>
                <SelectItem value="Public">Público</SelectItem>
              </SelectContent>
            </Select>

            <FieldError errors={[formState.errors.visibility]}/>
          </FieldContent>
        </Field>
      </section>
    </form>
  )
}