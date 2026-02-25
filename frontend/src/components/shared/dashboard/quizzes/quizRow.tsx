import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { QuizResponse } from "@/types/dashboard/quizzes";
import { Check, Clock, HelpCircle, Shuffle, Target, X } from "lucide-react";

interface QuizRowProps {
  quiz: QuizResponse
  selected?: boolean
  onRowClick?: (file: QuizResponse) => void
  canEdit?: boolean
}

export function QuizRow({ quiz, onRowClick, selected }: QuizRowProps) {
  const handleClick = () => {
    if(onRowClick) {
      onRowClick(quiz)
    }
  }

  return (
    <TableRow
      className={cn(selected && "bg-primary/5", "cursor-pointer h-12")}
      onClick={handleClick}
    >
      <TableCell className="font-medium max-w-64 truncate">
        {quiz.title}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs gap-1">
          <HelpCircle className="w-4 h-4" />
          {quiz.publicQuestionsAmount}/{quiz.questionsAmount}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs gap-1">
          <Target className="w-4 h-4" />
          {quiz.passingScorePercentage}%
        </Badge>
      </TableCell>
      <TableCell>
        {quiz.timeLimitSecs && quiz.timeLimitSecs > 0 ? (
          <Badge variant="outline" className="text-xs gap-1">
            <Clock className="w-4 h-4" />
            {formatDuration(quiz.timeLimitSecs, true)}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Sin límite</span>
        )}
      </TableCell>
      <TableCell>
        {quiz.shuffleQuestions ? (
          <Badge variant="secondary" className="text-xs gap-1">
            <Shuffle className="w-4 h-4" />
            Sí
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">No</span>
        )}
      </TableCell>
      <TableCell>
        {quiz.showCorrectAnswers ? (
          <Badge variant="secondary" className="text-xs gap-1">
            <Check className="w-4 h-4" />
            Sí
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs gap-1">
            <X className="w-4 h-4" />
            No
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(quiz.createdAt)}
      </TableCell>
    </TableRow>
  )
}