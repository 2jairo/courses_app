import type { CoursePermissionsRole } from "../common/coursePermissions"

// REQUEST
export interface SetUserPermissionsRequest {
  username: string
  role: CoursePermissionsRole
  courseId: number
}

export interface GetCourseMembersRequest {
  courseId: number
}

export interface DeleteUserPermissionsRequest {
  username: string
  courseId: number
}

// RESPONSE
export interface GetCourseMembersResponse {
  role: CoursePermissionsRole
  username: string
  avatar: string | null
}

