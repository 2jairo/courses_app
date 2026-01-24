import { Badge } from '@/components/ui/badge';
import { formatLectureKind } from '@/lib/format';
import type { LectureKind } from '@/types/lectures';
import { FileText, FlaskConical, BookOpenText, PlayCircle, type LucideProps } from 'lucide-react'

interface CourseLectureIconProps {
  lectureKind: LectureKind
}

export function LectureKindIcon({ lectureKind, ...props }: CourseLectureIconProps & LucideProps) {
  switch (lectureKind) {
    case 'Document': return <FileText {...props} />
    case 'Lab': return <FlaskConical {...props} />
    case 'Quiz': return <BookOpenText {...props} />
    case 'Video': return <PlayCircle {...props} />
  }
}

export function LectureKindBadge({ lectureKind }: CourseLectureIconProps) {
  return (
    <Badge variant="secondary" className="text-xs flex items-center gap-1 h-5">
      <LectureKindIcon lectureKind={lectureKind} className="w-3.5 h-3.5" />
      <span className="hidden md:inline text-sm">{formatLectureKind(lectureKind)}</span>
    </Badge>
  );
};