import type { SerializedEditorState, SerializedLexicalNode } from "lexical"
import type { CdnResponse } from "../common/cdn"
import type { LectureKind, LectureVisibility } from "../common/lectures"
import type { VideoPlayerSubtitle } from "../videoPlayer"
import type { FileKind } from "../common/files"


// REQUEST
export interface PlayLectureRequest {
  lectureSlug: string
}


// RESPONSE
export type PlayLectureResponse = {
  id: number
  slug: string
  createdAt: string
  visibility: LectureVisibility
  position: number
  kind: LectureKind
  title: string
  description: string
  estimatedDurationSecs: number
  seen: boolean
  assets: PlayLectureAssetsResponse[]
} & (
  | { kind: 'Video', data: PlayLectureResponseKindVideo }
  | { kind: 'Document', data: PlayLectureResponseKindDocument }
  | { kind: 'Quiz', data: PlayLectureResponseKindQuiz }
  | { kind: 'Lab', data: PlayLectureResponseKindLab }
)
export interface PlayLectureAssetsResponse {
  name: string
  size: number
  kind: FileKind
  fileId: number
  cdn: CdnResponse
}

export interface PlayLectureResponseKindVideo {
  poster: string
  duration: number
  subtitles: VideoPlayerSubtitle[]
  thumbnails: string
  resolutions: [number, number][]
  mediaPlaylist: string
  fileId: number
  cdn: CdnResponse
}

export interface PlayLectureResponseKindDocument {
  body: SerializedEditorState<SerializedLexicalNode>
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PlayLectureResponseKindQuiz {
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PlayLectureResponseKindLab {
}