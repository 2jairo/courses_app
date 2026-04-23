package coursepurchases

import (
	"fmt"
	"strings"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	typesenseentity "github.com/2jairo/courses_app/backend/A_core_service/entity/typesenseentity"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/typesense/typesense-go/v4/typesense/api"
	"github.com/typesense/typesense-go/v4/typesense/api/pointer"
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
		return nil, global.Err(err)
	}

	return purchase, nil
}

func (s *CoursePurchasesService) GetPurchasedCourses(input GetPurchasedCoursesInput) ([]typesenseentity.CourseDocument, error) {
	purchases, err := s.Repo.CoursePurchase.Find(
		&entity.CoursePurchase{UserID: input.UserID},
		entity.CoursePurchasePreloadOptions{},
		input.Pagination,
	)
	if err != nil {
		return nil, global.Err(err)
	}
	if len(purchases) == 0 {
		return []typesenseentity.CourseDocument{}, nil
	}

	ids := make([]string, 0, len(purchases))
	for _, purchase := range purchases {
		ids = append(ids, fmt.Sprintf("`%d`", purchase.CourseID))
	}

	courses, _, err := s.Repo.Search.SearchCourses(
		&api.SearchCollectionParams{
			Q:        pointer.String("*"),
			FilterBy: pointer.String(fmt.Sprintf("id:=[%s]", strings.Join(ids, ","))),
		},
	)
	if err != nil {
		return nil, global.Err(err)
	}

	return courses, nil
}
