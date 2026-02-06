import type { SerializedEditorState, SerializedLexicalNode } from "lexical"
import type { LectureKind, LectureVisibility } from "../common/lectures"
import type { VideoPlayerSubtitle } from "../videoPlayer"

// REQUEST
export interface CreateLectureRequestKindVideo {
  fileId: number
}
export interface CreateLectureRequestKindDocument {
  body: SerializedEditorState<SerializedLexicalNode>
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CreateLectureRequestKindQuiz {
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CreateLectureRequestKindLab {
}

export type CreateLectureRequest = {
  title: string
  description: string
  visibility?: LectureVisibility
  courseSectionId: number
  lectureKind: LectureKind
} & (
  | { lectureKind: 'Video', lectureData: CreateLectureRequestKindVideo }
  | { lectureKind: 'Document', lectureData: CreateLectureRequestKindDocument }
  | { lectureKind: 'Quiz', lectureData: CreateLectureRequestKindQuiz }
  | { lectureKind: 'Lab', lectureData: CreateLectureRequestKindLab }
)

export type UpdateLectureRequest = {
  lectureId: number
  title?: string
  description?: string
  visibility?: LectureVisibility
  lectureKind?: LectureKind
} & (
  | { lectureKind?: 'Video', lectureData?: CreateLectureRequestKindVideo }
  | { lectureKind?: 'Document', lectureData?: CreateLectureRequestKindDocument }
  | { lectureKind?: 'Quiz', lectureData?: CreateLectureRequestKindQuiz }
  | { lectureKind?: 'Lab', lectureData?: CreateLectureRequestKindLab }
)

export interface UpdateLecturePositionRequest {
  lectureId: number
  position: number
  courseSectionId: number
}

export interface MoveLectureToSectionRequest {
  lectureId: number
  newCourseSectionId: number
}

export interface DeleteLectureRequest {
  lectureId: number
}

export interface GetLectureRequest {
  lectureId: number
}

// RESPONSE
export interface LectureResponseExtended {
  id: number
  slug: string
  createdAt: string
  visibility: LectureVisibility
  courseSectionSlug: string
  position: number
  kind: LectureKind
  title: string
  description: string
  estimatedDurationSecs: number
}

export type LectureResponse = {
  id: number
  slug: string
  createdAt: string
  visibility: LectureVisibility
  courseSectionId: number
  position: number
  title: string
  description: string
  kind: LectureKind
  dataId: number
  estimatedDurationSecs: number
} & (
  | { kind: 'Video', data: LectureResponseDataKindVideo }
  | { kind: 'Document', data: LectureResponseDataKindDocument }
  | { kind: 'Quiz', data: LectureResponseDataKindQuiz }
  | { kind: 'Lab', data: LectureResponseDataKindLab }
)

export interface LectureResponseDataKindVideo {
  poster: string
  duration: number
  subtitles: VideoPlayerSubtitle[]
  thumbnails: string
  resolutions: [number, number][]
  mediaPlaylist: string
  fileId: number
}
export interface LectureResponseDataKindDocument {
  body: SerializedEditorState<SerializedLexicalNode>
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LectureResponseDataKindQuiz {
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LectureResponseDataKindLab {
}