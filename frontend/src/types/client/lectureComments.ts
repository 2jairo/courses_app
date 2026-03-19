export interface LectureCommentAuthor {
  isStaff: boolean
  isSelf: boolean
  username: string
  avatar?: string
}

export interface LectureCommentResponse {
  id: number
  createdAt: string
  updatedAt: string
  body: string 
  replyCount: number
  replyFromStaff: boolean
  parentCommentId: number | null
  author: LectureCommentAuthor
}

export interface GetLectureCommentsRequest {
  lectureSlug: string
  parentCommentId?: number
}

export interface CreateLectureCommentRequest {
  lectureSlug: string
  body: string
  parentCommentId?: number
}

export interface UpdateLectureCommentRequest {
  commentId: number
  body: string
}

export interface DeleteLectureCommentRequest {
  commentId: number
}