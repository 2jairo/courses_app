package payments

import entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"

type CreatePaymentIntentInput struct {
	UserID            entitycommon.Id
	SavePaymentMethod bool
	PaymentMethodId   *entitycommon.Id
}

type AddCourseToLibraryInput struct {
	UserID   entitycommon.Id
	CourseID entitycommon.Id
}
