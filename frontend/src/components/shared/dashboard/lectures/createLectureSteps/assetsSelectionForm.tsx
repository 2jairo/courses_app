import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFilesQuery } from "@/queries/dashboard/files/useFilesQuery"
import type { UploadFilesResponse } from "@/types/files"
import { FileList } from "@/components/shared/files/filesList"

interface AssetsSelectionFormProps {
  onSubmit: (selectedFileIds: number[]) => void
  onBack: () => void
  isSubmitting: boolean
  courseId: number
  initialSelectedFiles?: UploadFilesResponse[]
}

export function AssetsSelectionForm({ 
  onSubmit, 
  onBack, 
  isSubmitting, 
  courseId, 
  initialSelectedFiles = [] 
}: AssetsSelectionFormProps) {
  const filesQuery = useFilesQuery({ courseId: courseId, status: 'Ready' })
  const [selectedFiles, setSelectedFiles] = useState<UploadFilesResponse[]>(initialSelectedFiles)

  useEffect(() => {
    setSelectedFiles(initialSelectedFiles)
  }, [initialSelectedFiles])

  const allFiles =  filesQuery.data?.pages.flat() || []

  const handleFileToggle = (file: UploadFilesResponse) => {
    setSelectedFiles(prev => {
      const isAlreadySelected = prev.some(f => f.id === file.id)
      if (isAlreadySelected) {
        return prev.filter(f => f.id !== file.id)
      } else {
        return [...prev, file]
      }
    })
  }

  const handleSubmit = () => {
    const selectedFileIds = selectedFiles.map(file => file.id)
    onSubmit(selectedFileIds)
  }

  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Seleccionar archivos complementarios</h3>
        <p className="text-sm text-muted-foreground">
          Puedes seleccionar archivos complementarios para esta lección (opcional).
          Estos archivos estarán disponibles como material de apoyo para los estudiantes.
        </p>
      </div>

      <div className="min-h-0 h-full flex flex-col">
        <div className="flex-1 overflow-auto min-h-0">
          <FileList 
            files={allFiles}
            hasNextPage={filesQuery.hasNextPage ?? false}
            isFetchingNextPage={filesQuery.isFetchingNextPage}
            onLoadMore={filesQuery.fetchNextPage}
            selectedFiles={selectedFiles}
            onRowClick={(f) => handleFileToggle(f)}
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Atrás
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSubmit([])}
            disabled={isSubmitting}
          >
            Omitir
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cargando..." : "Confirmar"}
          </Button>
        </div>
      </div>
    </div>
  )
}