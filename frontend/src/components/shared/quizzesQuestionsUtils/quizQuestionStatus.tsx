import { Badge } from "@/components/ui/badge"
import { formatQuizQuestionStatus } from "@/lib/format"
import type { QuizQuestionStatus } from "@/types/common/quizzesQuestions"
import type { ShadcnVariant } from "@/types/shadcnVariants"
import { Eye, Lock, type LucideProps } from "lucide-react"

interface QuizQuestionStatusProps {
  status: QuizQuestionStatus
  variant?: ShadcnVariant
}

export function QuizQuestionStatusIcon({ status, ...props }: { status: QuizQuestionStatus } & LucideProps) {
  switch (status) {
    case "Public":
      return <Eye {...props} />
    case "Private":
      return <Lock {...props} />
  }
}

export function QuizQuestionStatusBadge({ status, variant }: QuizQuestionStatusProps) {
  return (
    <Badge
      variant={variant || "secondary"}
      className="text-xs flex items-center gap-1 h-5"
    >
      <QuizQuestionStatusIcon status={status} className="w-4 h-4" />
      <span className="hidden md:inline text-sm">
        {formatQuizQuestionStatus(status)}
      </span>
    </Badge>
  )
}
