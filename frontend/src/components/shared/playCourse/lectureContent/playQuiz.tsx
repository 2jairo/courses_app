import { HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PlayLectureResponse, PlayLectureResponseKindQuiz } from "@/types/client/lectures"

interface PlayQuizProps {
  lecture: PlayLectureResponse & { kind: "Quiz"; data: PlayLectureResponseKindQuiz }
}

export function PlayQuiz({ lecture }: PlayQuizProps) {
  return (
    <div className="w-full p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {lecture.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Cuestionario</h3>
            <p className="text-muted-foreground">
              El contenido del cuestionario estará disponible próximamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
