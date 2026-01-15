export interface UserAuthServicieLoginRequestBody {
  credential: string
  password: string
}

export type UserSex = 'Male' | 'Female' | 'Other'

export interface UserAuthServiceRegisterRequestBody {
  username: string
  email: string
  password: string
  birth_date: Date,
  sex: UserSex
}

export interface UserAuthServiceUserProfileResponse {
  username: string
  email: string
  avatar: string | null
}