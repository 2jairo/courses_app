// REQUEST
export interface GetUsersByPrefixRequest {
  value: string
}

// RESPONSE
export interface GetUsersByPrefixResponse {
  username: string
  avatar?: string | null
}
