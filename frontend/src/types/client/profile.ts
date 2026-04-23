import type { SearchCoursesCourseResponse } from "@/types/client/search"

export type ProfileUserInfoResponse = {
  username: string
  email: string
  avatar: string | null
  unread_notifications: number
}

export type ProfileUserCourseResponse = SearchCoursesCourseResponse
