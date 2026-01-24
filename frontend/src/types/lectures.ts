export type LectureVisibility = 'Public' | 'Link' | 'Private'
export const LECTURE_VISIBILITY: LectureVisibility[] = ['Public', 'Link', 'Private']

export type LectureKind = 'Video' | 'Document' | 'Quiz' | 'Lab'
export const LECTURE_KIND: LectureKind[] = ['Video', 'Document', 'Quiz', 'Lab']

// REQUEST
export interface CreateLectureRequestKindVideo {
  fileId: number
}
export interface CreateLectureRequestKindDocument {
  body: string
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
} & (
  | { kind: 'Video', data: LectureResponseDataKindVideo }
  | { kind: 'Document', data: LectureResponseDataKindDocument }
  | { kind: 'Quiz', data: LectureResponseDataKindQuiz }
  | { kind: 'Lab', data: LectureResponseDataKindLab }
)

export interface LectureResponseDataKindVideo {
  duration: number
  resolutions: [number, number][]
  poster: string
  thumbnails: string
  subtitles: string[]
  nativeLanguage: string
}
export interface LectureResponseDataKindDocument {
  body: string
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LectureResponseDataKindQuiz {
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LectureResponseDataKindLab {
}