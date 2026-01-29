import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Brain } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { quizLectureDataSchema, type QuizLectureDataSchema, type SpecificStepLectureComponentProps, type SpecificStepSchema } from "./createLectureFormSchemas"
import { useCreateLectureMutation } from "@/mutations/dashboard/lectures/useCreateLectureMutation"


export function QuizLectureForm({ courseId, onSubmit, onBack, basicData, courseSectionId, specificData }: SpecificStepLectureComponentProps<QuizLectureDataSchema>) {
  const createLectureMutation = useCreateLectureMutation()
  const { handleSubmit } = useForm<QuizLectureDataSchema>({
    resolver: zodResolver(quizLectureDataSchema),
    defaultValues: specificData || {}, //TODO
  })

  const isSubmitting = createLectureMutation.isLoading

  const handleOnSubmit = (data: QuizLectureDataSchema) => {
    createLectureMutation.mutate({
      courseId,
      payload: {
        ...basicData,
        lectureKind: 'Quiz',
        lectureData: data, //TODO
        courseSectionId
      }
    }, {
      onSuccess: (lecture) => onSubmit(lecture.data as SpecificStepSchema)
    })
  }

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)} className="space-y-6 min-h-0 flex flex-col flex-1">
      <Card className="flex-1">
        <CardContent className="p-8 items-center justify-center flex flex-col flex-1">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Función de Quiz próximamente</h3>
          <p className="text-sm text-muted-foreground">
            La funcionalidad de creación de quizzes estará disponible en una próxima actualización.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4 mt-6 border-t">
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