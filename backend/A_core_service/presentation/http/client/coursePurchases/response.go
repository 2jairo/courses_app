package coursepurchases

import typesenseentity "github.com/2jairo/courses_app/backend/A_core_service/entity/typesenseentity"

type PurchasedCourseResponse struct {
	ID                  string   `json:"id"`
	Slug                string   `json:"slug"`
	UpdatedAt           int64    `json:"updatedAt"`
	LectureAccesibility string   `json:"lectureAccesibility"`
	Title               string   `json:"title"`
	Description         string   `json:"description"`
	Poster              string   `json:"poster"`
	Language            string   `json:"language"`
	LecturesAmmount     int32    `json:"lecturesAmmount"`
	Price               int32    `json:"price"`
	DiscountPercent     int32    `json:"discountPercent"`
	Tags                []string `json:"tags"`
	Author              string   `json:"author"`
	AvgRating           float64  `json:"avgRating"`
	TotalReviews        int64    `json:"totalReviews"`
	TotalPurchases      int64    `json:"totalPurchases"`
}

func (self *GetPurchasedCoursesRequest) getResponse(courses []typesenseentity.CourseDocument) []PurchasedCourseResponse {
	response := make([]PurchasedCourseResponse, len(courses))

	for i, course := range courses {
		response[i] = PurchasedCourseResponse{
			ID:                  course.ID,
			Slug:                course.Slug,
			UpdatedAt:           course.UpdatedAt,
			LectureAccesibility: course.LectureAccesibility,
			Title:               course.Title,
			Description:         course.Description,
			Poster:              course.Poster,
			Language:            course.Language,
			LecturesAmmount:     course.LecturesAmmount,
			Price:               course.Price,
			DiscountPercent:     course.DiscountPercent,
			Tags:                course.Tags,
			Author:              course.Author,
			AvgRating:           course.AvgRating,
			TotalReviews:        course.TotalReviews,
			TotalPurchases:      course.TotalPurchases,
		}
	}

	return response
}
