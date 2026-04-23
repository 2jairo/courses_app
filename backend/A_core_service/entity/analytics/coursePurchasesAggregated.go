package analytics

import entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"

type CoursePurchasesAggregated struct {
	CourseID entitycommon.Id
	Total    uint64
}

func (CoursePurchasesAggregated) TableName() string {
	return "course_purchases_aggregated"
}
