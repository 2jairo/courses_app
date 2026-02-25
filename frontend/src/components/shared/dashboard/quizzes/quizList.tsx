import { useNavigate } from "react-router-dom"
import {  ClipboardList, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { QuizResponse } from "@/types/dashboard/quizzes"
import { QuizRow } from "./quizRow"

interface QuizListProps {
  quizzes: QuizResponse[]
  courseId: number
  onLoadMore: () => void
  isFetchingNextPage: boolean
  hasNextPage: boolean
  onRowClick?: (quiz: QuizResponse) => void
  selectedQuizzes?: QuizResponse[]
}

export function QuizList({ quizzes, courseId, onLoadMore, isFetchingNextPage, hasNextPage, onRowClick, selectedQuizzes }: QuizListProps) {
  const navigate = useNavigate()

  if (quizzes.length === 0 && !isFetchingNextPage) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Sin cuestionarios</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Crea tu primer cuestionario para comenzar a evaluar a los estudiantes.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto space-y-4">
      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Preguntas</TableHead>
              <TableHead>Aprobación</TableHead>
              <TableHead>Tiempo</TableHead>
              <TableHead>Mezclar</TableHead>
              <TableHead>Respuestas</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <QuizRow 
                key={quiz.id}
                quiz={quiz}
                selected={selectedQuizzes?.some(q => q.id === quiz.id)}
                onRowClick={() => onRowClick ? onRowClick(quiz) : navigate(`/dashboard/quizzes/${courseId}/${quiz.id}`)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              "Cargar más"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
