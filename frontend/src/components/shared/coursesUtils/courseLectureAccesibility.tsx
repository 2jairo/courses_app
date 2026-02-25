import { Badge } from "@/components/ui/badge";
import { formatCourseLectureAccesibility } from "@/lib/format";
import type { CourseLecturesAccesibility } from "@/types/common/courses";
import type { ShadcnVariant } from "@/types/shadcnVariants";
import { BookOpen, ClipboardCheck, Layers, Lock, type LucideProps } from "lucide-react";


interface CourseLectureAccesibilityProps {
  accesibility: CourseLecturesAccesibility
  variant: ShadcnVariant
}

export function CourseLectureAccesibilityIcon({ accesibility, ...props }: { accesibility: CourseLecturesAccesibility } & LucideProps) {
  switch (accesibility) {
    case "Open":       return <BookOpen {...props} />;
    case "Section":    return <Layers {...props} />;
    case "QuizOrLab":  return <ClipboardCheck {...props} />;
    case "Closed":     return <Lock {...props} />;
  }
}

export function CourseLectureAccesibilityBadge({ accesibility, variant }: CourseLectureAccesibilityProps) {
  return (
    <Badge variant={variant} className="text-xs flex items-center gap-1">
      <CourseLectureAccesibilityIcon accesibility={accesibility} className="w-4 h-4" />
      <span className="hidden md:inline text-sm">{formatCourseLectureAccesibility(accesibility)}</span>
    </Badge>
  );
};