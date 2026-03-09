import type { CoursePermissionsRole } from "../common/coursePermissions"
import type { CourseLecturesAccesibility, CourseVisibility } from "../common/courses"
import type { FileKind } from "../common/files"
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
  lectureAccesibility: CourseLecturesAccesibility
  slug: string
  title: string
  description: string
  poster?: string | null
  lecturesAmmount: number
  publicLecturesAmmount: number
  lastSeenTime?: string | null
  completedLectures: number
  role?: CoursePermissionsRole
  id: number
  lectureAssets: number
  author: WatchCourseAuthorResponse
  sections: WatchCourseSectionResponse[]
}
export interface WatchCourseAuthorResponse {
  username: string
  avatar?: string | null
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
  isBlocked: boolean
  visibility: LectureVisibility
  position: number
  kind: LectureKind
  title: string
  description: string
  estimatedDurationSecs: number
  seen: boolean
  assets: WatchCourseLectureAssetResponse[]
}

export interface WatchCourseLectureAssetResponse {
  name: string
  size: number
  kind: FileKind
  fileId: number
}