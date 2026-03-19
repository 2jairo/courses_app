package favoritecourse

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
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
