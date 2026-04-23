package entity

import entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"

type NotificationTypeLectureCommentReplyMetadata struct {
	CourseId        entitycommon.Id `json:"courseId"`
	ParentCommentId entitycommon.Id `json:"parentCommentId"`
	ReplyId         entitycommon.Id `json:"replyId"`
}

type NotificationTypeLectureCommentReplyStaffMetadata struct {
	CourseId        entitycommon.Id `json:"courseId"`
	ParentCommentId entitycommon.Id `json:"parentCommentId"`
	ReplyId         entitycommon.Id `json:"replyId"`
}

type NotificationTypeCoursePermissionGrantedMetadata struct {
	CourseId entitycommon.Id       `json:"courseId"`
	Role     CoursePermissionsRole `json:"role"`
}

type NotificationTypeCoursePermissionRevokedMetadata struct {
	CourseId entitycommon.Id `json:"courseId"`
}

type NotificationTypeCourseVisibilityUpdatedMetadata struct {
	CourseId         entitycommon.Id   `json:"courseId"`
	CourseVisibility *CourseVisibility `json:"visibility"`
}

type NotificationTypeLecturePublishedMetadata struct {
	CourseId  entitycommon.Id `json:"courseId"`
	LectureId entitycommon.Id `json:"lectureId"`
}

type NotificationTypeOrderStatusUpdatedMetadata struct {
	OrderID entitycommon.Id `json:"orderId"`
	Status  OrderStatus     `json:"orderStatus"`
}

type NotificationTypeSessionNewLocationMetadata struct {
	IP       string                                       `json:"ip"`
	Location string                                       `json:"location"`
	Ua       NotificationTypeSessionNewLocationMetadataUa `json:"ua"`
}

type NotificationTypeSessionNewLocationMetadataUa struct {
	Os      string `json:"os"`
	Browser string `json:"browser"`
	Device  string `jsno:"device"`
}

type NotificationTypeCourseDiscountAvailableMetadata struct {
	CourseID        entitycommon.Id `json:"courseId"`
	DiscountPercent int32           `json:"discountPercent"`
	ValidUntil      string          `json:"validUntil"`
}

type NotificationTypeCourseMaterialUpdatedMetadata struct {
	CourseID   entitycommon.Id `json:"courseId"`
	SectionID  entitycommon.Id `json:"sectionId"`
	UpdateType string          `json:"updateType"`
}

type NotificationTypeQuizScoreAvailableMetadata struct {
	CourseID  entitycommon.Id `json:"courseId"`
	LectureID entitycommon.Id `json:"lectureId"`
	QuizID    entitycommon.Id `json:"quizId"`
	Score     int32           `json:"score"`
	MaxScore  int32           `json:"maxScore"`
	Passed    bool            `json:"passed"`
}
