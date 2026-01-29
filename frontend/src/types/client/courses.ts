import type { CourseVisibility } from "../common/courses"
import type { LectureKind, LectureVisibility } from "../common/lectures" 

// REQUEST
export interface WatchCourseRequest {
  courseSlug: string
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
  sections: WatchCourseSectionResponse[]
}

export interface WatchCourseSectionResponse {
  slug: string
  position: number
  title: string
  lectures: WatchCourseLectureResponse[]
}

export interface WatchCourseLectureResponse {
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