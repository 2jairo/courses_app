import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Code2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { labLectureDataSchema, type LabLectureDataSchema, type SpecificStepLectureComponentProps, type SpecificStepSchema } from "./createLectureFormSchemas"
import { useCreateLectureMutation } from "@/mutations/dashboard/lectures/useCreateLectureMutation"


export function LabLectureForm({ courseId, onSubmit, onBack, basicData, courseSectionId, specificData }: SpecificStepLectureComponentProps<LabLectureDataSchema>) {
  const createLectureMutation = useCreateLectureMutation()
  const { handleSubmit } = useForm<LabLectureDataSchema>({
    resolver: zodResolver(labLectureDataSchema),
    defaultValues: specificData || {}, //TODO
  })

  const isSubmitting = createLectureMutation.isLoading

  const handleOnSubmit = (data: LabLectureDataSchema) => {
    createLectureMutation.mutate({
      courseId,
      payload: {
        ...basicData,
        lectureKind: 'Lab',
        lectureData: data, //TODO
        courseSectionId
      }
    }, {
      onSuccess: (lecture) => onSubmit(lecture.data as SpecificStepSchema)
    })
  }

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)} className="space-y-6">
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Función de Laboratorio próximamente</h3>
          <p className="text-sm text-muted-foreground">
            La funcionalidad de creación de laboratorios de programación estará disponible en una próxima actualización.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atrás
        </Button>
        {/* <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear lección"}
        </Button> */}
        <Button type="submit" disabled={true}>
          Crear lección
        </Button>
      </div>
    </form>
  )
}