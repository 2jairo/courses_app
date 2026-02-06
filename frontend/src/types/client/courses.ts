import type { CoursePermissionsRole } from "../common/coursePermissions"
import type { CourseVisibility } from "../common/courses"
import type { LectureKind, LectureVisibility } from "../common/lectures" 

// REQUEST
export interface WatchCourseRequest {
  courseSlug: string
}

export interface MarkLectureAsSeenRequest { 
  lectureId: number
  courseId: number
}

export interface ResetCourseProgressRequest {
  courseId: number
}


// RESPONSE
export interface WatchCourseResponse {
  updatedAt: string
  visibility: CourseVisibility
  slug: string
  title: string
  description: string
  poster?: string | null
  lecturesAmmount: number
  lastSeenTime?: string | null
  completedLectures: number
  role?: CoursePermissionsRole
  id: number
  sections: WatchCourseSectionResponse[]
}

export interface WatchCourseSectionResponse {
  slug: string
  position: number
  title: string
  lectures: WatchCourseLectureResponse[]
}

export interface WatchCourseLectureResponse {
  id: number
  slug: string
  createdAt: string
  visibility: LectureVisibility
  position: number
  kind: LectureKind
  title: string
  description: string
  estimatedDurationSecs: number
  seen: boolean
}