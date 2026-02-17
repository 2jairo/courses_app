import { Badge } from '@/components/ui/badge';
import { formatFileKind } from '@/lib/format';
import type { FileKind } from '@/types/common/files';
import type { ShadcnVariant } from '@/types/shadcnVariants';
import { type LucideProps, Video, ImageIcon, FileIcon } from 'lucide-react'

interface FileKindIconProps {
  fileKind: FileKind
  variant?: ShadcnVariant
}

export function FileKindIcon({ fileKind, ...props }: FileKindIconProps & LucideProps) {
  switch (fileKind) {
    case 'Image': return <ImageIcon {...props} />
    case 'Other': return <FileIcon {...props} />
    case 'Video': return <Video {...props} />
  }
}

export function FileKindBadge({ fileKind, variant }: FileKindIconProps) {
  return (
    <Badge variant={variant || 'secondary'} className="text-xs flex items-center gap-1 h-5">
      <FileKindIcon fileKind={fileKind} className="w-4 h-4" />
      <span className="hidden md:inline text-sm">{formatFileKind(fileKind)}</span>
    </Badge>
  );
};