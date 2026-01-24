import { Button } from "@/components/ui/button"
import { useCreateCourseMutation } from "@/mutations/dashboard/courses/useCreateCourseMutation"


export function CreateCourseButton() {
  const createMutation = useCreateCourseMutation()

  const handleClick = () => {
    if (createMutation.isLoading) return

    createMutation.mutate({}) //TODO
  }

  return (
    <Button size="sm" onClick={handleClick} disabled={createMutation.isLoading}>
      {createMutation.isLoading ? "Creando..." : "Crear curso"}
    </Button>
  )
}
