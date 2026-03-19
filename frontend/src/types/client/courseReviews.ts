// REQUEST
export interface CreateReviewRequest {
  courseSlug: string
  rating: number
  comment: string
}

export interface UpdateReviewRequest {
  reviewId: number
  rating?: number
  comment?: string
}

export interface GetReviewsRequest {
  courseSlug: string
  rating?: number
}

// RESPONSE

export interface ReviewResponse {
  id: number
  rating: number
  comment: string
  author: {
    username: string
    avatar?: string | null
    isSelf: boolean
  }
}
