import type { CoursePermissionsRole } from "../common/coursePermissions"
import type { CourseLanguage, CourseVisibility } from "../common/courses"
import type { Pagination } from "../pagination"
import type { CourseSectionResponse } from "./courseSections"
import type { LectureResponseExtended } from "./lectures"


// REQUEST
export interface CreateCourseRequest {
  title: string
  description: string
  poster?: string | null
  visibility?: CourseVisibility
  language: CourseLanguage
}

export interface GetDashboardCoursesRequest extends Pagination {
  q?: string | null
}

export interface UpdateCourseRequest {
  courseId: number
  title?: string
  description?: string
  posterFileId?: number | null
  visibility?: CourseVisibility
  language?: CourseLanguage
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
  language: CourseLanguage
  role: CoursePermissionsRole
}

export interface CourseResponseExtended extends CourseResponse {
  sections: CouseSectionResponseExtended[]
}

export interface CouseSectionResponseExtended extends CourseSectionResponse {
  lectures: LectureResponseExtended[]
}
