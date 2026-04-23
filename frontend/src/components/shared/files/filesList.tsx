import { FileText, Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { UploadFilesResponse } from "@/types/dashboard/files"
import { FileRow } from "./fileRow"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"

interface FileListProps {
  files: UploadFilesResponse[]
  selectedFiles?: UploadFilesResponse[]
  onLoadMore: () => void
  onRowClick?: (file: UploadFilesResponse) => void
  isFetchingNextPage: boolean
  hasNextPage: boolean
  canEdit?: boolean
}

export function FileList({ 
  files, selectedFiles, onLoadMore, onRowClick, isFetchingNextPage, hasNextPage, canEdit
}: FileListProps) {
  const observerTarget =  useInfiniteScroll({ fetchNextPage: onLoadMore, isFetchingNextPage, hasNextPage })

  
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
      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Archivo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Tamaño</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cargado por</TableHead>
              
              {canEdit && <TableHead>Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <FileRow 
                selected={selectedFiles?.some(f => f.id === file.id)} 
                onRowClick={onRowClick} 
                key={file.id} 
                file={file}
                canEdit={canEdit}
              />
            ))}
          </TableBody>
        </Table>
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
