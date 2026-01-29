import { useState } from "react"
import { Upload, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useUploadFilesMutation } from "@/mutations/dashboard/files/useUploadFilesMutation"
import { Spinner } from "@/components/ui/spinner"
import { CP } from "@/lib/permissions"
import { FILE_KIND, type FileKind } from "@/types/common/files"
import type { CoursePermissionsRole } from "@/types/common/coursePermissions"
import { formatFileKind } from "@/lib/format"

interface FilesDropzoneDialogProps {
  courseId: number
  currentUserPermission: CoursePermissionsRole
}

interface FileWithKind {
  file: File
  kind: FileKind
}

// Helper function to guess file type from MIME type
const guessFileKind = (mimeType: string): FileKind => {
  if (mimeType.startsWith("image/")) {
    return "Image"
  }
  if (mimeType.startsWith("video/")) {
    return "Video"
  }
  return "Other"
}

export function FilesDropzoneDialog({ courseId, currentUserPermission }: FilesDropzoneDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileWithKind[]>([])
  const uploadFilesMutation = useUploadFilesMutation()

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const filesWithKind = files.map(file => ({
      file,
      kind: guessFileKind(file.type)
    }))
    setSelectedFiles((prev) => [...prev, ...filesWithKind])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const filesWithKind = files.map(file => ({
      file,
      kind: guessFileKind(file.type)
    }))
    setSelectedFiles((prev) => [...prev, ...filesWithKind])
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const updateFileKind = (index: number, newKind: FileKind) => {
    setSelectedFiles((prev) => 
      prev.map((fileWithKind, i) => 
        i === index ? { ...fileWithKind, kind: newKind } : fileWithKind
      )
    )
  }

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      uploadFilesMutation.mutate({
        courseId: courseId,
        files: selectedFiles
      })

      setSelectedFiles([])
      setIsOpen(false)
    }
  }

  const handleClose = () => {
    setSelectedFiles([])
    setIsOpen(false)
  }

  const setIsOpenWrapper = (value: boolean) => {
    if(!uploadDisabled) {
      setIsOpen(value)
    }
  }

  const isFileKindOptionDisabled = (f: FileWithKind, kind: FileKind) => {
    if (kind === "Video" && f.file.type.startsWith("image/")) return true
    if (kind === "Image" && f.file.type.startsWith("video/")) return true
    return false
  }

  const uploadDisabled = uploadFilesMutation.isLoading || !CP.canUploadFiles(currentUserPermission)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpenWrapper}>
      <DialogTrigger> 
        <Button disabled={uploadDisabled} onClick={() => setIsOpenWrapper(true)}>
          {uploadFilesMutation.isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Cargando
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Cargar archivos
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="min-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Cargar archivos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Arrastra archivos aquí</p>
                <p className="text-xs text-muted-foreground">o</p>
              </div>
            </div>
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <Button variant="outline" size="sm" className="mt-4">
              Seleccionar archivos
            </Button>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {selectedFiles.length} archivo(s) seleccionado(s)
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedFiles.map((fileWithKind, index) => (
                  <div
                    key={`${fileWithKind.file.name}-${index}`}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg bg-muted p-3 text-sm w-full overflow-hidden"
                  >
                    <div className="min-w-0 overflow-hidden">
                      <p className="text-foreground max-w-full font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                        {fileWithKind.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(fileWithKind.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    
                    <Select 
                      value={fileWithKind.kind} 
                      onValueChange={(value: FileKind) => updateFileKind(index, value)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {FILE_KIND.map((f) => (
                          <SelectItem value={f} disabled={isFileKindOptionDisabled(fileWithKind, f)}>
                            {formatFileKind(f)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0 hover:text-destructive text-muted-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0}
            >
              Cargar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
