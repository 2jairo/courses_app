import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

import { quizLectureDataSchema, type QuizLectureDataSchema, type SpecificStepLectureComponentProps } from "./createLectureFormSchemas"
import { useCreateLectureMutation } from "@/mutations/dashboard/lectures/useCreateLectureMutation"
import { useUpdateLectureMutation } from "@/mutations/dashboard/lectures/useUpdateLectureMutation"
import { useQuizzesQuery } from "@/queries/dashboard/quizzes/useQuizzesQuery"
import type { GetQuizzesRequest } from "@/types/dashboard/quizzes"
import { QuizzesListFilters } from "@/components/shared/dashboard/quizzes/quizzesListFilters"
import { QuizList } from "@/components/shared/dashboard/quizzes/quizList"


export function QuizLectureForm({ courseId, lectureId, onSubmit, onBack, onForward, basicData, courseSectionId, specificData, isEditMode }: SpecificStepLectureComponentProps<QuizLectureDataSchema>) {
  const [quizzesQueryFilters, setQuizzesQueryFilters] = useState<Omit<GetQuizzesRequest, 'courseId'>>({
    sortBy: 'date',
    sortOrder: 'desc',
    q: null,
  })

  const quizzesQuery = useQuizzesQuery({ courseId, ...quizzesQueryFilters })
  const createLectureMutation = useCreateLectureMutation()
  const updateLectureMutation = useUpdateLectureMutation()

  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<QuizLectureDataSchema>({
    resolver: zodResolver(quizLectureDataSchema),
    defaultValues: {
      quizId: specificData?.quizId
    }
  })

  const isSubmitting = createLectureMutation.isLoading

  const handleOnSubmit = (data: QuizLectureDataSchema) => {
    if(isEditMode) {
      updateLectureMutation.mutate({
        courseId,
        payload: {
          ...basicData,
          lectureKind: 'Quiz',
          lectureData: { quizId: data.quizId },
          lectureId: lectureId!,
        }
      },  {
        onSuccess: (lecture) => onSubmit(lecture)
      })
    } else {
      createLectureMutation.mutate({
        courseId,
        payload: {
          ...basicData,
          lectureKind: 'Quiz',
          lectureData: data,
          courseSectionId
        }
      }, {
        onSuccess: (lecture) => onSubmit(lecture)
      })
    }
  }

  const quizzes = (quizzesQuery.data?.pages || []).flat()
  const selectedQuizId = watch("quizId")
  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId)

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)} className="flex flex-col h-full min-h-0">
      <div className="flex flex-col flex-1 min-h-0">
        <Field className="min-h-0 gap-0">
          <FieldLabel>Quiz</FieldLabel>
          <FieldContent className="min-h-0">
            <div className="min-h-0 h-full flex flex-col gap-4">
              <FieldDescription className="py-2">
                Selecciona el quiz que se utilizará para esta lección.
              </FieldDescription>

              <div className="flex-1 overflow-auto min-h-0 flex flex-col gap-4">
                <QuizzesListFilters
                  isRefetching={quizzesQuery.isRefetching}
                  refetch={quizzesQuery.refetch}
                  filters={quizzesQueryFilters}
                  onFiltersChange={(f) => setQuizzesQueryFilters(f)}
                />
                <QuizList
                  courseId={courseId}
                  quizzes={quizzes}
                  selectedQuizzes={selectedQuiz ? [selectedQuiz] : []}
                  onRowClick={(q) => setValue('quizId', q.id)}
                  onLoadMore={quizzesQuery.fetchNextPage}
                  isFetchingNextPage={quizzesQuery.isFetchingNextPage}
                  hasNextPage={quizzesQuery.hasNextPage ?? false}
                />
              </div>
            </div>

            {errors.quizId && <FieldError>{errors.quizId.message}</FieldError>}
          </FieldContent>
        </Field>
      </div>

      <div className="mt-4 pt-4 border-t flex justify-between shrink-0">
        <div className="flex gap-4 items-center">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Atrás
          </Button>

          {isEditMode && (
            <Button type="button" variant="outline" onClick={onForward} disabled={isSubmitting}>
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting || !selectedQuizId}>
          {isEditMode
            ? isSubmitting ? "Actualizando..." : "Actualizar"
            : isSubmitting ? "Creando..." : "Crear lección"
          }
        </Button>
      </div>
    </form>
  )
}