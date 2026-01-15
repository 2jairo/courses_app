package coursepermissions

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/middleware"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CoursePermissionsEndpoints struct {
	State *state.AppState
}

func (self *CoursePermissionsEndpoints) RegisterRoutes(r fiber.Router) {
	r.Post("/:courseSlug", self.State.AuthMiddleware.ClientAuth(), self.SetUserPermissions)
	r.Get("/:courseSlug", self.State.AuthMiddleware.ClientAuth(), self.GetCourseIntegrants)
}

func (self *CoursePermissionsEndpoints) SetUserPermissions(ctx *fiber.Ctx) error {
	c := &SetUserPermissionsRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	course := &entity.Course{Slug: entity.Slug{Slug: c.Params.CourseSlug}}
	if err := self.State.CourseRepository.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	user := &entity.User{Username: c.Body.Username}
	if err := self.State.UserRepository.FindOne(user); err != nil {
		return err
	}

	userJwtClaims := ctx.Locals(middleware.LocalsMwJwtClaims).(*utils.ClientJwtClaims)
	currentUserPermissions := &entity.CoursePermissions{
		UserID:   userJwtClaims.UserId,
		CourseID: course.ID,
	}
	if err := self.State.CoursePermissionsRepository.FindOne(
		currentUserPermissions,
		entity.CoursePermissionsPreloadOptions{},
	); err != nil {
		return err
	}

	otherUserPermissions := &entity.CoursePermissions{
		UserID:   user.ID,
		CourseID: course.ID,
	}
	if err := self.State.CoursePermissionsRepository.FindOne(
		otherUserPermissions,
		entity.CoursePermissionsPreloadOptions{},
	); err != nil {
		if err == gorm.ErrRecordNotFound {
			otherUserPermissions.Role = entity.CoursePermissionsRoleRead
		} else {
			return err
		}
	}

	if !currentUserPermissions.Role.CanSetRole(otherUserPermissions.Role, c.Body.Role) {
		return &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
	}

	permissions := &entity.CoursePermissions{
		UserID:   user.ID,
		CourseID: course.ID,
		Role:     c.Body.Role,
	}
	if err := self.State.CoursePermissionsRepository.Create(permissions); err != nil {
		return err
	}

	ctx.Status(fiber.StatusOK)
	return nil
}

func (self *CoursePermissionsEndpoints) GetCourseIntegrants(ctx *fiber.Ctx) error {
	c := &GetCourseIntegrantsRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	course := &entity.Course{Slug: entity.Slug{Slug: c.CourseSlug}}
	if err := self.State.CourseRepository.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	permissionsFindBy := &entity.CoursePermissions{CourseID: course.ID}
	preload := entity.CoursePermissionsPreloadOptions{User: true}
	permissions, err := self.State.CoursePermissionsRepository.Find(permissionsFindBy, preload)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(permissions))
}
