import { PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { WatchCourseResponse } from "@/types/client/courses"
import { Link } from "react-router-dom"

interface PlayEmptyStateProps {
  course: WatchCourseResponse
}

export function PlayWithoutLecture({ course }: PlayEmptyStateProps) {
  // Find the first lecture to start with
  const firstSection = course.sections.sort((a, b) => a.position - b.position)[0]
  const firstLecture = firstSection?.lectures.sort((a, b) => a.position - b.position)[0]

  return (
    <div className="flex flex-col items-center justify-center h-full bg-muted/30 p-8">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
          <PlayCircle className="h-8 w-8 text-primary" />
        </div>
        
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          ¡Bienvenido al curso!
        </h2>
        
        <p className="text-muted-foreground mb-6">
          {course.title}
        </p>
        
        <p className="text-sm text-muted-foreground mb-6">
          Selecciona una lección del panel lateral para comenzar a aprender, o haz clic en el botón de abajo para empezar desde el principio.
        </p>

        {firstLecture && (
          <Link to={`/play/${course.slug}/${firstLecture.slug}`}>
            <Button size="lg" className="gap-2">
              <PlayCircle className="h-5 w-5" />
              Comenzar curso
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
