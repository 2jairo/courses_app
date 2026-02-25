import { Badge } from "@/components/ui/badge"
import { formatQuizQuestionKind } from "@/lib/format"
import type { QuizQuestionKind } from "@/types/common/quizzesQuestions"
import type { ShadcnVariant } from "@/types/shadcnVariants"
import {
  CheckSquare,
  Text,
  GitBranch,
  ListOrdered,
  type LucideProps,
} from "lucide-react"

interface QuizQuestionKindProps {
  kind: QuizQuestionKind
  variant?: ShadcnVariant
}

export function QuizQuestionKindIcon({ kind, ...props }: { kind: QuizQuestionKind } & LucideProps) {
  switch (kind) {
    case "BoolMultiple":
      return <CheckSquare {...props} />
    case "BoolSingle":
      return <CheckSquare {...props} />
    case "TextMultiple":
      return <Text {...props} />
    case "TextSingle":
      return <Text {...props} />
    case "Match":
      return <GitBranch {...props} />
    case "Ordering":
      return <ListOrdered {...props} />
  }
}

export function QuizQuestionKindBadge({ kind, variant }: QuizQuestionKindProps) {
  return (
    <Badge variant={variant || "secondary"} className="text-xs flex items-center gap-1 h-5">
      <QuizQuestionKindIcon kind={kind} className="w-4 h-4" />
      <span className="hidden md:inline text-sm">
        {formatQuizQuestionKind(kind)}
      </span>
    </Badge>
  )
}
