import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { useCreateCourseSectionMutation } from "@/mutations/dashboard/courseSections/useCreateCourseSectionMutation"
import { createCourseSectionFormSchema, type CreateCourseSectionFormSchema } from "./createCourseSectionFormSchema"
import type { CoursePermissionsRole } from "@/types/common/coursePermissions"
import { CP } from "@/lib/permissions"

interface CreateCourseSectionDialogProps {
  courseId: number
  currentUserPermission: CoursePermissionsRole
}

export function CreateCourseSectionDialog({ courseId, currentUserPermission }: CreateCourseSectionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const createCourseSectionMutation = useCreateCourseSectionMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCourseSectionFormSchema>({
    resolver: zodResolver(createCourseSectionFormSchema),
    defaultValues: { title: "" },
    mode: "onBlur",
  })

  const onSubmit = (values: CreateCourseSectionFormSchema) => {
    createCourseSectionMutation.mutate({
      courseId,
      title: values.title,
    })
    
    reset()
    setIsOpen(false)
  }

  const handleClose = () => {
    reset()
    setIsOpen(false)
  }

  const isDisabled = createCourseSectionMutation.isLoading || !CP.canModifyCourseSections(currentUserPermission)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={isDisabled} onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva sección
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear nueva sección</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="title">Título de la sección</FieldLabel>
            <FieldContent>
              <Input
                id="title"
                placeholder="Ej: Introducción al curso"
                {...register("title")}
                disabled={isSubmitting}
              />
              <FieldDescription>
                Escribe un título descriptivo para esta sección del curso
              </FieldDescription>
              {errors.title && <FieldError>{errors.title.message}</FieldError>}
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
              {isSubmitting ? "Creando..." : "Crear sección"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}