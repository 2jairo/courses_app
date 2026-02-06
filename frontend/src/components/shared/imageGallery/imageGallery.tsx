import { FileText, Loader2 } from "lucide-react"
import type { UploadFilesResponse } from "@/types/dashboard/files"
import { useEffect, useRef } from "react"
import { ImageCard } from "./ImageCard"

interface FileListProps {
  files: UploadFilesResponse[]
  selectedFiles?: UploadFilesResponse[] | { id: number }[]
  onLoadMore: () => void
  onRowClick?: (file: UploadFilesResponse) => void
  isFetchingNextPage: boolean
  hasNextPage: boolean
}

export function ImageGallery({ 
  files, selectedFiles, onLoadMore, onRowClick, isFetchingNextPage, hasNextPage 
}: FileListProps) {
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [onLoadMore, hasNextPage, isFetchingNextPage])

  
  if (files.length === 0 && !isFetchingNextPage) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Sin archivos</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Carga algunos archivos para comenzar.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {files.map((file) => (
          <ImageCard
            key={file.id}
            file={file}
            selected={selectedFiles?.some((f) => f.id === file.id)}
            onClick={onRowClick}
          />
        ))}
      </div>

      {/* Intersection observer target for infinite scroll */}
      <div ref={observerTarget} className="h-2" />

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
