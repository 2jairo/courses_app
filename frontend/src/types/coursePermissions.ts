export type CoursePermissionsRole = "Owner" | "Admin" | "Write" | "Read"
export const COURSE_PERMISSIONS_ROLE: CoursePermissionsRole[] = ["Owner", "Admin", "Write", "Read"]

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

