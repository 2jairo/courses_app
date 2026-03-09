import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCoursePermissionsRole } from "@/lib/format";
import type { CoursePermissionsRole } from "@/types/common/coursePermissions";
import type { ShadcnVariant } from "@/types/shadcnVariants";
import { Crown, Shield, Edit, Eye, type LucideProps } from "lucide-react";


interface CourseRoleProps {
  role: CoursePermissionsRole
  variant: ShadcnVariant
}

export function CourseRoleIcon({ role, ...props }: { role: CoursePermissionsRole } & LucideProps) {
  switch (role) {
    case "Owner": return <Crown {...props} />;
    case "Admin": return <Shield {...props} />;
    case "Write": return <Edit {...props} />;
    case "Read": return <Eye {...props} />;
  }
}
 
export function CourseRoleBadge({ role, variant }: CourseRoleProps) {
  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Badge variant={variant} className="text-xs flex items-center gap-1">
          <CourseRoleIcon role={role} className="w-4 h-4" />
          <span className="hidden md:inline text-sm">{formatCoursePermissionsRole(role)}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="z-999">
        Rol del curso
      </TooltipContent>
    </Tooltip>
  );
};