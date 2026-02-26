//REQUEST
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

export interface UserAuthServiceLogoutRequestQuery {
  all_sessions: boolean
}

// RESPONSE
export interface UserAuthServiceUserProfileResponse {
  username: string
  email: string
  avatar: string | null
}


export type DeviceType = 'Desktop' | 'Mobile' | 'Tablet' | 'SmartTv' | 'Other'
export type BrowserType = 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'InternetExplorer' | 'Opera' | 'Brave' | 'Other'
export type OperatingSystem = 'Windows' | 'MacOS' | 'IOS' | 'Android' | 'Linux' | 'ChromeOS' | 'Other'

export interface UserAuthServiceGetUserSesssion {
  id: number
  device: DeviceType
  browser: BrowserType
  os: OperatingSystem
  is_current: boolean
  is_online: boolean
  created_at: string
  updated_at: string
}