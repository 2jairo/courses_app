export type FileKind = "Image" | "Video" | "Other"
export const FILE_KIND: FileKind[] = ["Image", "Video", "Other"]

export type FileStatus = "Pending" | "Processing" | "Ready" | "Failed"
export const FILE_STATUS: FileStatus[] = ["Pending", "Processing", "Ready", "Failed"]

// REQUEST
export interface UploadFilesRequest {
  files: {
    kind: FileKind
    file: File
  }[]
  courseId: number
}

export interface GetFilesRequest {
  courseId: number
  kind?: FileKind
  status?: FileStatus
}

// RESPONSE
export type UploadFilesResponse = {
  id: number
  createdAt: string
  status: FileStatus
  kind: FileKind
  originalName: string
  fileSize: number
  user: {
    username: string
    id: number
    avatar: string | null
  }
  cdn: {
    base: string
  }
} & (
  | { kind: 'Video', metadata: UploadFilesResponseMetadataVideo }
  | { kind: 'Image', metadata: UploadFilesResponseMetadataImage }
  | { kind: 'Other', metadata: UploadFilesResponseMetadataOther }
)

export interface UploadFilesResponseMetadataVideo {
  duration?: number
  resolutions?: [number, number][]
  poster?: string
  thumbnails?: string
  subtitles?: {
    native: string
    languages: string[]
  }
  nativeLanguage?: string
}
export interface UploadFilesResponseMetadataImage {
  resolutions?: {
    path: string
    w: number
    h: number
  }[]
}
export type UploadFilesResponseMetadataOther = object