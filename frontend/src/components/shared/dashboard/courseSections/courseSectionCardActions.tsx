import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Pencil, Plus } from "lucide-react"
import type { CouseSectionResponseExtended } from "@/types/dashboard/courses"
import { Button } from "@/components/ui/button"
import { courseSectionUpdateSchema, type CourseSectionUpdateSchema } from "./courseSectionCardActionsSchema"
import { useUpdateCourseSectionMutation } from "@/mutations/dashboard/courseSections/useUpdateCourseSectionMutation"
import { DialogDelete } from "@/components/shared/dialogs/dialogDelete"
import { useDeleteCourseSectionMutation } from "@/mutations/dashboard/courseSections/useDeleteCourseSectionMutation"
import { CreateLectureDialog } from "../lectures/createLectureSteps/createLectureDialog"
import { CP } from "@/lib/permissions"
import type { CoursePermissionsRole } from "@/types/common/coursePermissions"
import { cn } from "@/lib/utils"
// import { useCreateLectureMutation } from "@/mutations/lectures/useCreateLectureMutation"

interface SortableSectionActionsProps {
  section: CouseSectionResponseExtended
  currentUserPermission: CoursePermissionsRole
  courseId: number
}

export function CourseSectionCardActions({ section, courseId, currentUserPermission }: SortableSectionActionsProps) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)

  const deleteCourseSectionMutation = useDeleteCourseSectionMutation()
  const updateCourseSectionMutation = useUpdateCourseSectionMutation()

  const { register, handleSubmit, formState } = useForm<CourseSectionUpdateSchema>({
    resolver: zodResolver(courseSectionUpdateSchema),
    defaultValues: {
      title: section.title,
    },
  })

  const onSubmitUpdate = (values: CourseSectionUpdateSchema) => {
    updateCourseSectionMutation.mutate({
      courseId: courseId,
      sectionId: section.id,
      title: values.title
    }, {
      onSuccess: () => {
        toast.success("Sección actualizada")
        setIsUpdateOpen(false)
      },
    })
  }

  const handleDelete = () => {
    deleteCourseSectionMutation.mutate({
      courseId: courseId,
      sectionId: section.id
    })
    toast.success("Sección eliminada")
  }

  const sectionActionDisabled = !CP.canModifyCourseSections(currentUserPermission)
  const createLectureDisabled = !CP.canModifyLecture(currentUserPermission)

  return (
    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
      <CreateLectureDialog 
        courseId={courseId} 
        courseSectionId={section.id}
        trigger={(setIsOpen) => (
          <Button disabled={createLectureDisabled} title="crear lección" variant="ghost" onClick={setIsOpen}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      />

      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsUpdateOpen(true)}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md dark:hover:bg-muted/50 cursor-pointer",
              sectionActionDisabled && "pointer-events-none opacity-50"
            )}
            title="Editar sección"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar sección</span>
          </div>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar sección</DialogTitle>
            <DialogDescription>
              Modifica el título de la sección.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitUpdate)} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="title">Título</FieldLabel>
              <FieldContent>
                <Input id="title" {...register("title")} />
                <FieldError errors={[formState.errors.title]} />
              </FieldContent>
            </Field>

            <DialogFooter>
              <Button 
                variant="outline"
                onClick={() => setIsUpdateOpen(false)}
              >
                Cancelar
              </Button>

              <Button type="submit">
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DialogDelete 
        entity="sección"
        handleDelete={handleDelete}
        trigger="icon"
        isLoading={deleteCourseSectionMutation.isLoading || sectionActionDisabled}
      >
        Al eliminar esta sección, también se eliminarán todas las{" "}
        <strong>{section.lectures?.length || 0} lecciones</strong> que contiene.
        Esta acción no se puede deshacer.
      </DialogDelete>
    </div>
  )
}
