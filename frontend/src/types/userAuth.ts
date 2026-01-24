export type UserSex = 'Male' | 'Female' | 'Other'

// REQUEST
export interface UserAuthServicieLoginRequestBody {
  credential: string
  password: string
}

export interface UserAuthServiceRegisterRequestBody {
  username: string
  email: string
  password: string
  birth_date: Date,
  sex: UserSex
}

// RESPONSE
export interface UserAuthServiceUserProfileResponse {
  username: string
  email: string
  avatar: string | null
}