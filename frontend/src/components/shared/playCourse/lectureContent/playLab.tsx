import { FlaskConical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PlayLectureResponse, PlayLectureResponseKindLab } from "@/types/client/lectures"

interface PlayLabProps {
  lecture: PlayLectureResponse & { kind: "Lab"; data: PlayLectureResponseKindLab }
}

export function PlayLab({ lecture }: PlayLabProps) {
  return (
    <div className="w-full p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            {lecture.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Laboratorio</h3>
            <p className="text-muted-foreground">
              El contenido del laboratorio estará disponible próximamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
