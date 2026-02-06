import { useState } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { FILE_KIND, type FileKind } from "@/types/common/files"
import { formatFileKind } from "@/lib/format"
import { useUploadFilesMutation } from "@/mutations/dashboard/files/useUploadFilesMutation"
import { useUploadImageMutation } from "@/mutations/dashboard/files/useUploadImageMutation"

interface FileWithKind {
  file: File
  kind: FileKind
}

interface FilesDropzoneContentProps {
  courseId: number
  onSuccess?: () => void
  uploadDisabled?: boolean
  image?: boolean
}

const guessFileKind = (mimeType: string): FileKind => {
  if (mimeType.startsWith("image/")) return "Image"
  if (mimeType.startsWith("video/")) return "Video"
  return "Other"
}

export function FilesDropzoneContent({
  courseId,
  onSuccess,
  uploadDisabled = false,
  image
}: FilesDropzoneContentProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileWithKind[]>([])
  const uploadFilesMutation = useUploadFilesMutation()
  const uploadImageMutation = useUploadImageMutation()

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type !== "dragleave")
  }

  const addFiles = (files: File[], reset = false) => {
    setSelectedFiles((prev) => {
      const newFiles = files.map((file) => ({
        file,
        kind: guessFileKind(file.type),
      }))

      return reset ? [...newFiles] : [...prev, ...newFiles]
    })
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if(!e.dataTransfer.files.length) {
      return
    }

    if(image) {
      addFiles([e.dataTransfer.files[0]], true)
    } else {
      addFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files?.length) {
      return
    }

    if(image) {
      addFiles([e.target.files[0]], true)
    } else {
      addFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const updateFileKind = (index: number, kind: FileKind) => {
    setSelectedFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, kind } : f))
    )
  }

  const handleUpload = () => {
    if (!selectedFiles.length) return

    if (image) {
      uploadImageMutation.mutate(
        { courseId, image: selectedFiles[0].file },
        {
          onSuccess: () => {
            setSelectedFiles([])
            onSuccess?.()
          },
        }
      )
    } else {
      uploadFilesMutation.mutate(
        { courseId, files: selectedFiles },
        {
          onSuccess: () => {
            setSelectedFiles([])
            onSuccess?.()
          },
        }
      )
    }
  }

  const isLoading = uploadFilesMutation.isLoading || uploadImageMutation.isLoading

  const isFileKindOptionDisabled = (f: FileWithKind, kind: FileKind) => {
    if (kind === "Video" && f.file.type.startsWith("image/")) return true
    if (kind === "Image" && f.file.type.startsWith("video/")) return true
    return false
  }

  return (
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
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">Arrastra archivos aquí</p>
        <p className="text-xs text-muted-foreground">o</p>

        <input
          type="file"
          accept={image ? "image/*" : "*/*"}
          multiple={!image}
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
        />

        <Button variant="outline" size="sm" className="mt-4">
          Seleccoinar archivos
        </Button>
      </div>

      {/* Files list */}
      {!image && selectedFiles.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {selectedFiles.map((f, index) => (
            <div
              key={`${f.file.name}-${index}`}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg bg-muted p-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{f.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(f.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <Select
                value={f.kind}
                onValueChange={(v: FileKind) => updateFileKind(index, v)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILE_KIND.map((k) => (
                    <SelectItem
                      key={k}
                      value={k}
                      disabled={isFileKindOptionDisabled(f, k)}
                    >
                      {formatFileKind(k)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {image && selectedFiles.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <img
            src={URL.createObjectURL(selectedFiles[0].file)}
            alt={selectedFiles[0].file.name}
            className="w-full max-h-50 rounded-lg object-contain border"
          />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground truncate max-w-xs">{selectedFiles[0].file.name}</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeFile(0)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setSelectedFiles([])}
          disabled={selectedFiles.length === 0 || isLoading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleUpload}
          disabled={ uploadDisabled || selectedFiles.length === 0 || isLoading}
        >
          {isLoading && (
            <Spinner className="mr-2 h-4 w-4" />
          )}
          Cargar
        </Button>
      </div>
    </div>
  )
}
