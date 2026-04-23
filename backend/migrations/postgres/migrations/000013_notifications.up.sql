-- Notification types for the system
CREATE TYPE "NotificationType" AS ENUM (
    'LectureCommentReply',
    'LectureCommentReplyFromStaff',
    'CoursePermissionGranted',
    'CoursePermissionRevoked',
    'CourseVisibilityUpdated',
    'LecturePublished',
    'NotificationStatusUpdated',
    'SessionNewLocation',
    'CourseDiscountAvailable',
    'CourseMaterialUpdated',
    'QuizScoreAvailable'
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type "NotificationType" NOT NULL,    
    actor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    seen BOOLEAN NOT NULL DEFAULT FALSE,
    seen_at TIMESTAMPTZ,
    metadata JSONB NOT NULL
);