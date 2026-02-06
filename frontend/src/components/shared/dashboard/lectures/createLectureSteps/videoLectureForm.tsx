import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Video, RefreshCw, ArrowRight } from "lucide-react"

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

import { videoLectureDataSchema, type SpecificStepLectureComponentProps, type VideoLectureDataSchema } from "./createLectureFormSchemas"
import { useFilesQuery } from "@/queries/dashboard/files/useFilesQuery"
import { formatFileSize, formatDuration, formatFileStatus } from "@/lib/format"
import { FileList } from "@/components/shared/files/filesList"
import type { GetFilesRequest, UploadFilesResponse } from "@/types/dashboard/files"
import { useCreateLectureMutation } from "@/mutations/dashboard/lectures/useCreateLectureMutation"
import { FileStatusIcon } from "@/components/shared/files/fileCard"
import { VideoPlayer } from "@/components/shared/player/player"
import { FileListFilters } from "@/components/shared/files/filesListFilters"
import { useDashboardCoursePermissionsQuery } from "@/queries/dashboard/coursePermissions/useCoursePermissions"
import { useState } from "react"
import { useUpdateLectureMutation } from "@/mutations/dashboard/lectures/useUpdateLectureMutation"


export function VideoLectureForm({ 
  courseId, 
  courseSectionId, 
  lectureId,
  onSubmit, 
  onBack, 
  onForward, 
  basicData, 
  specificData,
  isEditMode
}: SpecificStepLectureComponentProps<VideoLectureDataSchema>) {
  const [filesQueryFilters, setFilesQueryFilters] = useState<Omit<GetFilesRequest, 'courseId'>>({ 
    kind: ["Video"],
    status: ["Ready"],
    sortBy: "date",
    sortOrder: "desc",
    q: null,
    user: []
  })

  const filesQuery = useFilesQuery({ courseId, ...filesQueryFilters })
  const usersWithPermissionsQuery = useDashboardCoursePermissionsQuery({ courseId: courseId })
  const createLectureMutation = useCreateLectureMutation()
  const updateLectureMutation = useUpdateLectureMutation()

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
    if(isEditMode) {
      updateLectureMutation.mutate({
        courseId,
        payload: {
          ...basicData,
          lectureKind: 'Video',
          lectureData: { fileId: data.fileId },
          lectureId: lectureId!
        }
      }, {
        onSuccess: (lecture) => onSubmit(lecture)
      })
    } else {
      createLectureMutation.mutate({
        courseId,
        payload: {
          ...basicData,
          lectureKind: 'Video',
          lectureData: { fileId: data.fileId },
          courseSectionId
        }
      }, {
        onSuccess: (lecture) => onSubmit(lecture)
      })
    }    

  }
  
  const files = (filesQuery.data?.pages || []).flat()
  const selectedFileId = watch("fileId")
  const selectedFile = files.find((file) => file.id === selectedFileId)

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
            <div className="min-h-0 h-full flex flex-col gap-4">
              <FieldDescription className="py-2">
                Selecciona el video que se utilizará para esta lección.
                Solo se pueden seleccionar archivos de video con estado 
                <Badge className="gap-1 ml-2 text-xs">
                  <FileStatusIcon status={'Ready'} />
                  {formatFileStatus('Ready')}
                </Badge>         
              </FieldDescription>

              
              <div className="flex-1 overflow-auto min-h-0 flex flex-col gap-4">
                <FileListFilters
                  disabledFilters={["kind", "status"]}
                  filters={filesQueryFilters}
                  onFiltersChange={(f) => setFilesQueryFilters(f)}
                  usernameOptions={usersWithPermissionsQuery.data?.map((u) => u.username)}
                />
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
      <div className="mt-4 pt-4 border-t flex justify-between shrink-0">
        <div className="flex gap-4 items-center">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Atrás
          </Button>

          {isEditMode && (
            <Button type="button" variant="outline" onClick={onForward} disabled={isSubmitting}>
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting || !selectedFileId}>
          {isEditMode
            ? isSubmitting ? "Actualizando..." : "Actualizar"
            : isSubmitting ? "Creando..." : "Crear lección"
          }
        </Button>
      </div>
    </form>
  )
}

const SelectedFileCard = ({ selectedFile }: { selectedFile: UploadFilesResponse }) => {
  return (
    <Card className="p-0 border border-primary bg-primary/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {selectedFile.kind === "Video" && (
            <div className="max-w-75 shrink-0 overflow-hidden rounded-lg">
              <VideoPlayer 
                baseUrl={selectedFile.cdn.base}
                poster={selectedFile.metadata.poster || ''}
                subtitles={selectedFile.metadata.subtitles || []}
                thumbnails={selectedFile.metadata.thumbnails || ''}
                videoSrc={selectedFile.metadata.mediaPlaylist || ''}
                autoplay={false}
                disabledControls={["rewind10s", "forward10s"]}
              />
            </div>
          )}

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
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {selectedFile.metadata.duration && (
                    <span className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      {formatDuration(selectedFile.metadata.duration, true)}
                    </span>
                  )}
                  <span>{formatFileSize(selectedFile.fileSize)}</span>
                </div>

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

                {selectedFile.metadata.subtitles?.length && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Subtítulos:</h5>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {selectedFile.metadata.subtitles.map((lang) => (
                          <Badge 
                            key={lang.language}
                            variant={lang.native ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {lang.language.toUpperCase()} {lang.native && '(Nativo)'}
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