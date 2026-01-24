import { Badge } from "@/components/ui/badge";
import { formatLectureVisibility } from "@/lib/format";
import type { LectureVisibility } from "@/types/lectures";
import { Globe, Link2, Lock, type LucideProps } from "lucide-react";


interface LectureVisibilityProps {
  visibility: LectureVisibility
}

export function LectureVisibilityIcon({ visibility, ...props }: { visibility: LectureVisibility } & LucideProps) {
  switch (visibility) {
    case "Public": return <Globe {...props} />;
    case "Link": return <Link2 {...props} />;
    case "Private": return <Lock {...props} />;
  }
}
 
export function LectureVisibilityBadge({ visibility }: LectureVisibilityProps) {
  return (
    <Badge variant="default" className="text-xs flex items-center gap-1 h-5">
      <LectureVisibilityIcon visibility={visibility}  className="w-3.5 h-3.5" />
      <span className="hidden md:inline text-sm">{formatLectureVisibility(visibility)}</span>
    </Badge>
  );
};