import { Badge } from "@/components/ui/badge";
import { formatCourseVisibility } from "@/lib/format";
import type { CourseVisibility } from "@/types/common/courses";
import type { ShadcnVariant } from "@/types/shadcnVariants";
import { Globe, Link2, Lock, type LucideProps } from "lucide-react";


interface CourseVisibilityProps {
  visibility: CourseVisibility
  variant: ShadcnVariant
}

export function CourseVisibilityIcon({ visibility, ...props }: { visibility: CourseVisibility } & LucideProps) {
  switch (visibility) {
    case "Public": return <Globe {...props} />;
    case "Link": return <Link2 {...props} />;
    case "Private": return <Lock {...props} />;
  }
}
 
export function CourseVisibilityBadge({ visibility, variant }: CourseVisibilityProps) {
  return (
    <Badge variant={variant} className="text-xs flex items-center gap-1">
      <CourseVisibilityIcon visibility={visibility}  className="w-4 h-4" />
      <span className="hidden md:inline text-sm">{formatCourseVisibility(visibility)}</span>
    </Badge>
  );
};