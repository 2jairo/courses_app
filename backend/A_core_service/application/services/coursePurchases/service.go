package coursepurchases

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
)

type CoursePurchasesService struct {
	Repo *infrastructure.AppRepositories
}

// FindOne retrieves a single course purchase by user and course
func (s *CoursePurchasesService) FindOne(input FindOneInput) (*entity.CoursePurchase, error) {
	purchase := &entity.CoursePurchase{
		UserID:   input.UserID,
		CourseID: input.CourseID,
	}

	err := s.Repo.CoursePurchase.FindOne(purchase, entity.CoursePurchasePreloadOptions{})
	if err != nil {
		return nil, err
	}

	return purchase, nil
}
