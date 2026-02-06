import type { UploadFilesResponse } from "@/types/dashboard/files"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { UserAvatar } from "../userAvatar/userAvatar"
import { cn } from "@/lib/utils"
import {
  ImageIcon,
  Video,
  FileText,
  Play,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Pencil,
} from "lucide-react"
import { formatDate, formatDuration, formatFileSize, formatFileStatus, getFileStatusVariant } from "@/lib/format"
import type { FileStatus } from "@/types/common/files"
import { chooseClosestImageResolution } from "@/lib/imageResolution"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

interface FileCardProps {
  file: UploadFilesResponse
  selected?: boolean
  onRowClick?: (file: UploadFilesResponse) => void
  canEdit?: boolean
}
export function FileCard({ file, onRowClick, selected, canEdit }: FileCardProps) {
  const handleClick = () => {
    if(onRowClick) {
      onRowClick(file)
    }
  }

  return (
    <TableRow onClick={handleClick} className={cn(selected && "bg-primary/5")}>
      <TableCell>
        <div className="flex items-start gap-3">
          <FileThumbnail file={file} />

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{file.originalName}</p>
            <FileMetadata file={file} />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={getFileStatusVariant(file.status)}
          className="gap-1"
        >
          <FileStatusIcon status={file.status} />
          {formatFileStatus(file.status)}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatFileSize(file.fileSize)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(file.createdAt)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <UserAvatar className="w-8 h-8" avatar={file.user.avatar} username={file.user.username} />
          <span className="text-sm">{file.user.username}</span>
        </div>
      </TableCell>

      {canEdit && (
        <TableCell>
          {file.kind === 'Video' && (
            <Button size="xs">
              <Link to={`/dashboard/video/${file.id}`} className="flex items-center gap-2">
                <Pencil />
                editar
              </Link>
            </Button>
          )}
        </TableCell>
      )}
    </TableRow>
  )
}


function FileThumbnail({ file }: { file: UploadFilesResponse }) {
  const isReady = file.status === "Ready"
  
  // images
  if (file.kind === "Image" && isReady) {
    const src = `${file.cdn.base}/${chooseClosestImageResolution(file.metadata.resolutions || {}, 'thumbnail')?.path}`

    return (
      <div className="relative h-12 w-12 overflow-hidden rounded-lg">
        <img
          src={src}
          alt={file.originalName}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  // poster
  if (file.kind === "Video" && isReady && file.metadata.poster) {
    return (
      <div className="relative h-12 w-12 overflow-hidden rounded-lg">
        <img
          src={`${file.cdn.base}/${file.metadata.poster}`}
          alt={file.originalName}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play className="h-4 w-4 fill-white text-white" />
        </div>
      </div>
    )
  }

  // fallback
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-lg",
        file.kind === "Image" && "bg-blue-500/10 text-blue-500",
        file.kind === "Video" && "bg-rose-500/10 text-rose-500",
        file.kind === "Other" && "bg-muted text-muted-foreground"
      )}
    >
      {file.kind === "Image" && <ImageIcon className="h-4 w-4" />}
      {file.kind === "Video" && <Video className="h-4 w-4" />}
      {file.kind === "Other" && <FileText className="h-4 w-4" />}
    </div>
  )
}

function FileMetadata({ file }: { file: UploadFilesResponse }) {
  if (file.kind === "Video") {
    const metadata = file.metadata
    const maxRes = metadata.resolutions?.[0]
    return (
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {metadata.duration && 
          <span>{formatDuration(metadata.duration, true)}</span>
        }

        {maxRes && (
          <span>
            {maxRes[0]}p {maxRes[1]}fps
          </span>
        )}

        {metadata.subtitles && metadata.subtitles.length > 0 && (<>
          <span>{metadata.subtitles.length} subtítulo(s)</span>
          <span>{metadata.subtitles.find(l => l.native)?.language.toUpperCase()}</span>
        </>)}
      </div>
    )
  }

  if (file.kind === "Image") {
    const metadata = file.metadata
    const maxRes = chooseClosestImageResolution(metadata.resolutions || {}, 'native')
    
    return (
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {maxRes && (
          <span>
            {maxRes.w}x{maxRes.h}
          </span>
        )}

        {metadata.resolutions &&
          <span>{Object.keys(metadata.resolutions).length} resolución(es)</span>
        }
      </div>
    )
  }

  return null
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