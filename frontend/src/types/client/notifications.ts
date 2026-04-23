import type { CoursePermissionsRole } from "../common/coursePermissions"
import type { CourseVisibility } from "../common/courses"
import type { OrderStatus } from "../common/orders"
import type { BrowserType, DeviceType, OperatingSystem } from "./auth"

export const NOTIFICATION_TYPE = [
  "LectureCommentReply",
  "LectureCommentReplyFromStaff",
  "CoursePermissionGranted",
  "CoursePermissionRevoked",
  "CourseVisibilityUpdated",
  "LecturePublished",
  "NotificationStatusUpdated",
  "SessionNewLocation",
  "CourseDiscountAvailable",
  "CourseMaterialUpdated",
  "QuizScoreAvailable",
] as const

export type NotificationType = typeof NOTIFICATION_TYPE[number]

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type GetNotificationsRequest = {}

export interface NotificationActorResponse {
  id?: number
  username: string
  avatar?: string | null
}

export interface NotificationTypeLectureCommentReplyMetadata {
  courseId: number
  parentCommentId: number
  replyId: number
}

export interface NotificationTypeLectureCommentReplyStaffMetadata {
  courseId: number
  parentCommentId: number
  replyId: number
}

export interface NotificationTypeCoursePermissionGrantedMetadata {
  courseId: number
  role: CoursePermissionsRole
}

export interface NotificationTypeCoursePermissionRevokedMetadata {
  courseId: number
}

export interface NotificationTypeCourseVisibilityUpdatedMetadata {
  courseId: number
  visibility: CourseVisibility | null
}

export interface NotificationTypeLecturePublishedMetadata {
  courseId: number
  lectureId: number
}

export interface NotificationTypeOrderStatusUpdatedMetadata {
  orderId: number
  orderStatus: OrderStatus
}

export interface NotificationTypeSessionNewLocationMetadata {
  ip: string
  location: string
  ua: {
    os: OperatingSystem,
    browser: BrowserType,
    device: DeviceType, 
  }
}

export interface NotificationTypeCourseDiscountAvailableMetadata {
  courseId: number
  discountPercent: number
  validUntil: string
}

export interface NotificationTypeCourseMaterialUpdatedMetadata {
  courseId: number
  sectionId: number
  updateType: string
}

export interface NotificationTypeQuizScoreAvailableMetadata {
  courseId: number
  lectureId: number
  quizId: number
  score: number
  maxScore: number
  passed: boolean
}

interface NotificationResponseBase {
  seen: boolean
  seenAt: string | null
  actor?: NotificationActorResponse
}

export type NotificationResponse =
  | (NotificationResponseBase & {
      notificationType: "LectureCommentReply"
      metadata: NotificationTypeLectureCommentReplyMetadata
    })
  | (NotificationResponseBase & {
      notificationType: "LectureCommentReplyFromStaff"
      metadata: NotificationTypeLectureCommentReplyStaffMetadata
    })
  | (NotificationResponseBase & {
      notificationType: "CoursePermissionGranted"
      metadata: NotificationTypeCoursePermissionGrantedMetadata
    })
  | (NotificationResponseBase & {
      notificationType: "CoursePermissionRevoked"
      metadata: NotificationTypeCoursePermissionRevokedMetadata
    })
  | (NotificationResponseBase & {
      notificationType: "CourseVisibilityUpdated"
      metadata: NotificationTypeCourseVisibilityUpdatedMetadata
    })
  | (NotificationResponseBase & {
      notificationType: "LecturePublished"
      metadata: NotificationTypeLecturePublishedMetadata
    })
  | (NotificationResponseBase & {
      notificationType: "NotificationStatusUpdated"
      metadata: NotificationTypeOrderStatusUpdatedMetadata
    })
  | (NotificationResponseBase & {
      notificationType: "SessionNewLocation"
      metadata: NotificationTypeSessionNewLocationMetadata
    })
  | (NotificationResponseBase & {
      notificationType: "CourseDiscountAvailable"
      metadata: NotificationTypeCourseDiscountAvailableMetadata
    })
  | (NotificationResponseBase & {
      notificationType: "CourseMaterialUpdated"
      metadata: NotificationTypeCourseMaterialUpdatedMetadata
    })
  | (NotificationResponseBase & {
      notificationType: "QuizScoreAvailable"
      metadata: NotificationTypeQuizScoreAvailableMetadata
    })
