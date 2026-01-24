import type { CoursePermissionsRole } from "./coursePermissions"
import type { CourseSectionResponse } from "./courseSections"
import type { LectureResponseExtended } from "./lectures"
import type { Pagination } from "./pagination"

export type CourseVisibility = 'Private' | 'Link' | 'Public'
export const COURSE_VISIBILITY: CourseVisibility[] = ['Private', 'Link', 'Public'] 

// REQUEST
export interface CreateCourseRequest {
  title: string
  description: string
  poster?: string | null
  visibility?: CourseVisibility
}

export interface GetDashboardCoursesRequest extends Pagination {
  q?: string | null
}

export interface UpdateCourseRequest {
  courseId: number
  title?: string
  description?: string
  poster?: string | null
  visibility?: CourseVisibility
}

export interface DeleteCourseRequest {
  courseId: number
}

export interface GetDashboardCourseDetailsRequest {
  courseId: number
}

// RESPONSE
export interface CourseResponse {
  id: number
  updatedAt: Date
  visibility: CourseVisibility
  slug: string
  title: string
  description: string
  poster?: string | null
  lecturesAmmount: number
  role: CoursePermissionsRole
}

export interface CourseResponseExtended extends CourseResponse {
  sections: CouseSectionResponseExtended[]
}

export interface CouseSectionResponseExtended extends CourseSectionResponse {
  lectures: LectureResponseExtended[]
}
