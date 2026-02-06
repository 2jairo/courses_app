import { chooseClosestImageResolution } from "@/lib/imageResolution"
import type { UploadFilesResponse, UploadFilesResponseMetadataImage } from "@/types/dashboard/files"

interface ImageCardProps {
  file: UploadFilesResponse
  selected?: boolean
  onClick?: (file: UploadFilesResponse) => void
}

export const ImageCard = ({ file, selected, onClick }: ImageCardProps) => {
  const metadata = file.metadata as UploadFilesResponseMetadataImage
  const src = `${file.cdn.base}/${chooseClosestImageResolution(metadata.resolutions || {}, 'small')?.path}`

  return (
    <div
      className={`relative rounded-lg overflow-hidden border cursor-pointer transition-shadow hover:shadow-lg ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={() => onClick?.(file)}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
    >
      <img
        src={src}
        alt={file.originalName}
        className="w-full h-40 object-cover bg-muted"
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
        {file.originalName}
      </div>
      {selected && (
        <div className="absolute inset-0 bg-primary/20 pointer-events-none" />
      )}
    </div>
  )
}
