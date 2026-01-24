import { FileText, Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { UploadFilesResponse } from "@/types/files"
import { FileCard } from "./fileCard"
import { useEffect, useRef } from "react"

interface FileListProps {
  files: UploadFilesResponse[]
  selectedFiles?: UploadFilesResponse[]
  onLoadMore: () => void
  onRowClick?: (file: UploadFilesResponse) => void
  isFetchingNextPage: boolean
  hasNextPage: boolean
}

export function FileList({ 
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

  
  if (files.length === 0) {
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
      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Archivo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Tamaño</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cargado por</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <FileCard 
                selected={selectedFiles?.some(f => f.id === file.id)} 
                onRowClick={onRowClick} 
                key={file.id} 
                file={file}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Intersection observer target for infinite scroll */}
      <div ref={observerTarget} className="h-4" />

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
