import { useParams } from "react-router-dom"
import { useQuizDetailsQuery } from "@/queries/dashboard/quizzes/useQuizDetailsQuery"
import { useValidId } from "@/hooks/useValidId"
import { WFullSpinner } from "@/components/shared/fullPageSpinner/fullPageSpinner"
import { Separator } from "@/components/ui/separator"
import { QuizCommonPropsForm } from "@/components/shared/dashboard/quizzes/quizCommonPropsForm"
import { useCourseDetailsQuery } from "@/queries/dashboard/courses/useCourseDetailsQuery"
import { CreateQuestionDialog } from "@/components/shared/dashboard/quizzesQuestions/createQuestionDialog"
import { QuizQuestionsList } from "@/components/shared/dashboard/quizzesQuestions/quizQuestionsList"
import { useEffect } from "react"
import { setDocumentTitle } from "@/lib/documentTitle"

export default function QuizDetailPage() {
  const { courseId: courseIdStr, quizId: quizIdStr } = useParams()
  const courseId = useValidId(courseIdStr!, "/dashboard/courses")
  const quizId = useValidId(quizIdStr!, `/dashboard/courses/${courseIdStr}`)
  
  const quizDetails = useQuizDetailsQuery({ courseId: courseId!, quizId: quizId! })
  const courseDetails = useCourseDetailsQuery({ courseId: courseId! })
  
  useEffect(() => {
    setDocumentTitle(`Editar cuestionario: ${quizDetails.data?.title || ''}`)
  }, [quizDetails])

  return (
    <div>
      <section className="flex flex-1 flex-col gap-4 p-4 max-w-350 m-auto">     
        {quizDetails.data && courseDetails.data
          ? <QuizCommonPropsForm 
            quiz={quizDetails.data} 
            course={courseDetails.data} 
          />
          : <WFullSpinner className="w-8 h-8"/>
        }        
      </section>

      <div className="py-4">
        <Separator />
      </div>

      <section className="flex flex-1 flex-col gap-4 p-4 max-w-350 m-auto">
        <header className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Preguntas</h2>
            <p className="text-sm text-muted-foreground">
              Gestiona las preguntas del cuestionario.
            </p>
          </div>

          {quizDetails.data && courseDetails.data
            ? <CreateQuestionDialog 
              courseId={courseDetails.data.id}
              quizId={quizDetails.data.id}
            />
            : <WFullSpinner className="w-8 h-8"/>
          } 
        </header>

        {quizDetails.data
          ? <QuizQuestionsList
              questions={quizDetails.data.questions}
              courseId={courseId!}
              quizId={quizId!}
            />
          : <WFullSpinner className="w-8 h-8"/>
        }
      </section>
    </div>
  )
}
