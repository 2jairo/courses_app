import type { PlayLectureResponse } from "@/types/client/lectures"
import { PlayVideo } from "./playVideo"
import { PlayDocument } from "./playDocument"
import { PlayQuiz } from "./playQuiz"
import { PlayLab } from "./playLab"

interface PlayLectureContentProps {
  lecture: PlayLectureResponse
}

export function PlayLectureContent({ lecture }: PlayLectureContentProps) {
  switch (lecture.kind) {
    case "Video":
      return <PlayVideo lecture={lecture} />
    case "Document":
      return <PlayDocument lecture={lecture} />
    case "Quiz":
      return <PlayQuiz lecture={lecture} />
    case "Lab":
      return <PlayLab lecture={lecture} />
    default:
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Tipo de contenido no soportado
        </div>
      )
  }
}
