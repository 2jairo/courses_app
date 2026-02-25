import { useState } from "react"
import { Pencil, MoreVerticalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DialogDelete } from "@/components/shared/dialogs/dialogDelete"
import { CreateQuestionDialog } from "./createQuestionDialog"
import { useDeleteQuestionMutation } from "@/mutations/dashboard/quizzesQuestions/useDeleteQuestionMutation"
import { toast } from "sonner"
import type { ExtendedQuizResponseQuestion } from "@/types/dashboard/quizzes"

interface QuizQuestionCardActionsProps {
  question: ExtendedQuizResponseQuestion
  courseId: number
  quizId: number
}

export function QuizQuestionCardActions({ question, courseId, quizId }: QuizQuestionCardActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const deleteMutation = useDeleteQuestionMutation()

  const handleDelete = () => {
    deleteMutation.mutate(
      { questionId: question.id, courseId, quizId },
      { onSuccess: () => { toast.success("La pregunta ha sido eliminada correctamente") } }
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DialogDelete
            entity="pregunta"
            trigger="both"
            isLoading={deleteMutation.isLoading}
            handleDelete={handleDelete}
          >
            ¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer.
          </DialogDelete>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateQuestionDialog
        courseId={courseId}
        quizId={quizId}
        questionId={question.id}
        initialData={question}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        trigger={<p className="hidden"></p>}
      />
    </>
  )
}
