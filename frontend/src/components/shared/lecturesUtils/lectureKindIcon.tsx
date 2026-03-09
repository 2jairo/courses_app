import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatLectureKind } from '@/lib/format';
import type { LectureKind } from '@/types/common/lectures';
import type { ShadcnVariant } from '@/types/shadcnVariants';
import { FileText, type LucideProps, Video, Brain, Code2 } from 'lucide-react'

interface CourseLectureIconProps {
  lectureKind: LectureKind
  variant?: ShadcnVariant
}

export function LectureKindIcon({ lectureKind, ...props }: CourseLectureIconProps & LucideProps) {
  switch (lectureKind) {
    case 'Document': return <FileText {...props} />
    case 'Lab': return <Code2 {...props} />
    case 'Quiz': return <Brain {...props} />
    case 'Video': return <Video {...props} />
  }
}

export function LectureKindBadge({ lectureKind, variant }: CourseLectureIconProps) {
  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Badge variant={variant || 'secondary'} className="text-xs flex items-center gap-1 h-5">
          <LectureKindIcon lectureKind={lectureKind} className="w-4 h-4" />
          <span className="hidden md:inline text-sm">{formatLectureKind(lectureKind)}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="z-999">
        Tipo de lección
      </TooltipContent>
    </Tooltip>
  );
};