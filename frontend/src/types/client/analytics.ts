import type { AnalyticsViewSource } from "../common/analytics"

// REQUEST
export interface WatchCourseAnalyticsRequest {
  courseId: number
  viewSource: AnalyticsViewSource
}

export interface WatchLectureAnalyticsRequest {
  lectureId: number
  viewSeconds: number
}


// RESPONSE