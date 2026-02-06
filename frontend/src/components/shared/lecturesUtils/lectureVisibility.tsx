import { Badge } from "@/components/ui/badge";
import { formatLectureVisibility } from "@/lib/format";
import type { LectureVisibility } from "@/types/common/lectures";
import type { ShadcnVariant } from "@/types/shadcnVariants";
import { Globe, Link2, Lock, type LucideProps } from "lucide-react";


interface LectureVisibilityProps {
  visibility: LectureVisibility
  variant: ShadcnVariant
}

export function LectureVisibilityIcon({ visibility, ...props }: { visibility: LectureVisibility } & LucideProps) {
  switch (visibility) {
    case "Public": return <Globe {...props} />;
    case "Link": return <Link2 {...props} />;
    case "Private": return <Lock {...props} />;
  }
}
 
export function LectureVisibilityBadge({ visibility, variant }: LectureVisibilityProps) {
  return (
    <Badge variant={variant} className="text-xs flex items-center gap-1">
      <LectureVisibilityIcon visibility={visibility} className="w-4 h-4" />
      <span className="hidden md:inline text-sm">{formatLectureVisibility(visibility)}</span>
    </Badge>
  );
};