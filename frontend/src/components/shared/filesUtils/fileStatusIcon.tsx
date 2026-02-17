import { Badge } from "@/components/ui/badge"
import { formatFileStatus, getFileStatusVariant } from "@/lib/format"
import type { FileStatus } from "@/types/common/files"
import type { ShadcnVariant } from "@/types/shadcnVariants"
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react"

interface FileStatusIconProps {
  status: FileStatus
  variant?: ShadcnVariant
}

export function FileStatusIcon({ status }: { status: FileStatus }) {
  switch (status) {
    case "Pending":
      return <Clock className="h-3.5 w-3.5" />
    case "Processing":
      return <Loader2 className="h-3.5 w-3.5 animate-spin" />
    case "Ready":
      return <CheckCircle2 className="h-3.5 w-3.5" />
    case "Failed":
      return <XCircle className="h-3.5 w-3.5" />
  }
}

export function FileStatusBadge({ status, variant }: FileStatusIconProps) {
  return (
    <Badge variant={variant || getFileStatusVariant(status)} className="text-xs flex items-center gap-1 h-5">
      <FileStatusIcon status={status} />
      <span className="hidden md:inline text-sm">{formatFileStatus(status)}</span>
    </Badge>
  );
}