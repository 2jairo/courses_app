package favoritecourse

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

type FavoriteCourseService struct {
	Repo *infrastructure.AppRepositories
}

func (s *FavoriteCourseService) SetFavorite(input SetFavoriteInput) error {
	fav := &entity.FavoriteCourse{
		UserID:   input.UserID,
		CourseID: input.CourseID,
	}

	if input.Add {
		return s.Repo.FavoriteCourse.Create(fav)
	}
	return s.Repo.FavoriteCourse.Delete(fav)
}

func (s *FavoriteCourseService) GetFavoriteCourses(input GetFavoriteCoursesInput) ([]typesenseentity.CourseDocument, error) {
	favorites, err := s.Repo.FavoriteCourse.Find(
		&entity.FavoriteCourse{UserID: input.UserID},
		entity.FavoriteCoursePreloadOptions{},
		input.Pagination,
	)
	if err != nil {
		return nil, global.Err(err)
	}
	if len(favorites) == 0 {
		return []typesenseentity.CourseDocument{}, nil
	}

	ids := make([]string, 0, len(favorites))
	for _, favorite := range favorites {
		ids = append(ids, fmt.Sprintf("`%d`", favorite.CourseID))
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
