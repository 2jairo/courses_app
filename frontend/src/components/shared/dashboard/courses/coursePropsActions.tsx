import { Button } from "@/components/ui/button"
import type { CourseResponse } from  "@/types/dashboard/courses"

import { Link } from "react-router-dom"
import { DialogDelete } from "@/components/shared/dialogs/dialogDelete"
import { useDeleteCourseMutation } from "@/mutations/dashboard/courses/useDeleteCourseMutation"

interface CoursePropsActionsProps {
  course: CourseResponse
  disabledActions?: ('edit' | 'watch' | 'delete' | 'analytics')[]
}

export function CoursePropsActions({ course, disabledActions = []}: CoursePropsActionsProps) {
  const deleteMutation = useDeleteCourseMutation()
  
  const handleConfirmDelete = () => {
    if (deleteMutation.isLoading) return
    deleteMutation.mutate({ courseId: course.id })
  }

  return (
    <div className="flex justify-end items-center gap-2">
      {!disabledActions.includes('analytics') && (
        <Button size="xs" variant="outline">
          <Link to={`/dashboard/analytics/${course.id}`}>Estadísticas</Link>
        </Button>        
      )}

      {!disabledActions.includes('watch') && (
        <Button size="xs" variant="outline">
          <Link to={`/watch/${course.slug}`}>Visitar</Link>
        </Button>
      )}
      
      {!disabledActions.includes('edit') && (
        <Button size="xs" variant="outline">
          <Link to={`/dashboard/courses/${course.id}`}>Editar</Link>
        </Button>
      )}

      {!disabledActions.includes('delete') && (
        <DialogDelete 
          isLoading={deleteMutation.isLoading} 
          trigger="text"
          entity="curso" 
          handleDelete={handleConfirmDelete}
        >
          Esta acción no se puede deshacer. Se eliminará el curso "{course.title}" de forma permanente.
        </DialogDelete>
      )}
    </div>
  )
}
