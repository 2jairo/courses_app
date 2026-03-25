import type { CoursePermissionsRole } from "../common/coursePermissions"
import type { CourseLanguage, CourseLecturesAccesibility, CourseVisibility } from "../common/courses"
import type { PriceDiscountCurrency } from "../common/price"
import type { Pagination } from "../pagination"
import type { CourseSectionResponse } from "./courseSections"
import type { LectureResponseExtended } from "./lectures"


// REQUEST
export interface CreateCourseRequest {
  title: string
  description: string
  poster?: string | null
  visibility?: CourseVisibility
  lectureAccesibility?: CourseLecturesAccesibility
  language: CourseLanguage
  price: number
  discountPercent: number 
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
  lectureAccesibility?: CourseLecturesAccesibility
  language?: CourseLanguage
  price?: number
  discountPercent?: number 
}

export interface DeleteCourseRequest {
  courseId: number
}

export interface GetDashboardCourseDetailsRequest {
  courseId: number
}

// RESPONSE
export type CourseResponse = {
  id: number
  slug: string
  updatedAt: Date
  visibility: CourseVisibility
  lectureAccesibility: CourseLecturesAccesibility
  title: string
  description: string
  poster?: string | null
  lecturesAmmount: number
  language: CourseLanguage
  role: CoursePermissionsRole
} & PriceDiscountCurrency

export interface CourseResponseExtended extends CourseResponse {
  sections: CouseSectionResponseExtended[]
}

export interface CouseSectionResponseExtended extends CourseSectionResponse {
  lectures: LectureResponseExtended[]
}
