import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Video, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { videoLectureDataSchema, type SpecificStepLectureComponentProps, type SpecificStepSchema, type VideoLectureDataSchema } from "./createLectureFormSchemas"
import { useFilesQuery } from "@/queries/dashboard/files/useFilesQuery"
import { formatFileSize, formatDuration, formatFileStatus } from "@/lib/format"
import { FileList } from "@/components/shared/files/filesList"
import type { UploadFilesResponse } from "@/types/files"
import { useCreateLectureMutation } from "@/mutations/dashboard/lectures/useCreateLectureMutation"
import { useEffect } from "react"
import { FileStatusIcon } from "@/components/shared/files/fileCard"


export function VideoLectureForm({ courseId, onSubmit, onBack, onForward, basicData, courseSectionId, specificData }: SpecificStepLectureComponentProps<VideoLectureDataSchema>) {
  const createLectureMutation = useCreateLectureMutation()
  const filesQuery = useFilesQuery({ courseId, kind: 'Video', status: 'Ready' })
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VideoLectureDataSchema>({
    resolver: zodResolver(videoLectureDataSchema),
    defaultValues: {
      fileId: specificData?.fileId,
    },
  })

  const isSubmitting = createLectureMutation.isLoading

  const handleOnSubmit = (data: VideoLectureDataSchema) => {
    createLectureMutation.mutate({
      courseId,
      payload: {
        ...basicData,
        lectureKind: 'Video',
        lectureData: { fileId: data.fileId },
        courseSectionId
      }
    }, {
      onSuccess: (lecture) => onSubmit(lecture.data as SpecificStepSchema)
    })
  }
  
  const files = (filesQuery.data?.pages || []).flat()
  const selectedFileId = watch("fileId")
  const selectedFile = files.find((file) => file.id === selectedFileId)

  useEffect(() => {
    console.log({specificData, selectedFileId, files})
  }, [specificData, selectedFileId, files])


  return (
    <form onSubmit={handleSubmit(handleOnSubmit)} className="flex flex-col h-full min-h-0">
      <div className="flex flex-col flex-1 min-h-0">
        <Field className="min-h-0 gap-0">
          <div className="flex items-center justify-between">
            <FieldLabel>Video</FieldLabel>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => filesQuery.refetch()}
              disabled={filesQuery.isRefetching}
              className="h-8 px-2"
            >
              <RefreshCw className={`h-4 w-4 ${filesQuery.isRefetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <FieldContent className="min-h-0">
            <div className="min-h-0 h-full flex flex-col">
              <FieldDescription className="py-2">
                Selecciona el video que se utilizará para esta lección.
                Solo se pueden seleccionar archivos de video con estado 
                <Badge className="gap-1 ml-2 text-xs">
                  <FileStatusIcon status={'Ready'} />
                  {formatFileStatus('Ready')}
                </Badge>         
              </FieldDescription>

              <div className="flex-1 overflow-auto min-h-0">
                <FileList
                  onRowClick={(f) => setValue('fileId', f.id)}
                  files={files}
                  selectedFiles={selectedFile ? [selectedFile] : []}
                  onLoadMore={filesQuery.fetchNextPage}
                  isFetchingNextPage={filesQuery.isFetchingNextPage}
                  hasNextPage={filesQuery.hasNextPage ?? false}
                />
              </div>
            </div>

            {errors.fileId && <FieldError>{errors.fileId.message}</FieldError>}
          </FieldContent>
        </Field>

        {selectedFile && (
          <div className="mt-4">
            <SelectedFileCard selectedFile={selectedFile}/>
          </div>
        )}
      </div>

      {/* Fixed footer with buttons */}
      <div className="mt-6 pt-4 border-t flex justify-between shrink-0">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atrás
        </Button>
        <Button type="submit" disabled={isSubmitting || !selectedFileId}>
          {isSubmitting ? "Creando..." : "Crear lección"}
        </Button>
      </div>
    </form>
  )

}

const SelectedFileCard = ({ selectedFile }: { selectedFile: UploadFilesResponse }) => {
  return (
    <Card className="border border-primary bg-primary/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {/* Video Thumbnail - Made bigger */}
          <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-lg">
            {selectedFile.status === "Ready" && selectedFile.kind === "Video" && selectedFile.metadata.poster ? (
              <>
                <img
                  src={`${selectedFile.cdn.base}/${selectedFile.metadata.poster}`}
                  alt={selectedFile.originalName}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Video className="h-8 w-8 fill-white text-white" />
                </div>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-rose-500/10 text-rose-500">
                <Video className="h-8 w-8" />
              </div>
            )}
          </div>

          {/* Video Details */}
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold truncate text-lg">{selectedFile.originalName}</h4>
              <Badge
                variant={selectedFile.status === "Ready" ? "default" : "secondary"}
                className="gap-1 text-xs"
              >
                <FileStatusIcon status={selectedFile.status} />
                {formatFileStatus(selectedFile.status)}
              </Badge>
            </div>
            
            {/* Video Metadata */}
            {selectedFile.kind === "Video" && (
              <div className="space-y-3">
                {/* Basic info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {selectedFile.metadata.duration && (
                    <span className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      {formatDuration(selectedFile.metadata.duration, true)}
                    </span>
                  )}
                  <span>{formatFileSize(selectedFile.fileSize)}</span>
                </div>

                {/* Resolution information */}
                {selectedFile.metadata.resolutions && selectedFile.metadata.resolutions.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Resoluciones disponibles:</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedFile.metadata.resolutions.map((resolution, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="text-xs"
                        >
                          {resolution[0]}p {resolution[1]}fps
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subtitles information */}
                {selectedFile.metadata.subtitles && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Subtítulos:</h5>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Nativo: {selectedFile.metadata.subtitles.native.toUpperCase()}
                        </Badge>
                        {selectedFile.metadata.subtitles.languages.map((lang, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="text-xs"
                          >
                            {lang.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}