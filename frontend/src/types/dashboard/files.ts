import type { CdnResponse } from "../common/cdn"
import type { FileKind, FileStatus, ImageResolutionVariant } from "../common/files"
import type { VideoPlayerSubtitle } from "../videoPlayer"

// REQUEST
export interface UploadImageRequest {
  image: File
  courseId: number
}

export interface UploadFilesRequest {
  files: {
    kind: FileKind,
    file: File
  }[]
  courseId: number
}

export interface GetFilesRequest {
  courseId: number
  kind: FileKind[]
  status: FileStatus[]
  user: string[]
  q: string | null
  sortBy: 'date' | 'name' | 'size' | 'user'
  sortOrder: 'asc' | 'desc'
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
  cdn: CdnResponse
} & (
  | { kind: 'Video', metadata: UploadFilesResponseMetadataVideo }
  | { kind: 'Image', metadata: UploadFilesResponseMetadataImage }
  | { kind: 'Other', metadata: UploadFilesResponseMetadataOther }
)

export interface UploadFilesResponseMetadataVideo {
  poster?: string
  duration?: number
  subtitles?: VideoPlayerSubtitle[]
  thumbnails?: string
  resolutions?: [number, number][]
  mediaPlaylist?: string
}

export interface UploadFilesResponseMetadataImage {
  resolutions?: {
    [K in ImageResolutionVariant]?: {
      path: string
      w: number
      h: number
    }
  }

}
export type UploadFilesResponseMetadataOther = object