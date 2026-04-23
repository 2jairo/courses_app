// REQUEST
export interface GetTagsRequest {
  q?: string // min=3, max=30
}


// RESPONSE 

export interface TagResponse {
  id: number
  slug: string
  name: string
}