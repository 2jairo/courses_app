package coursepermissions

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
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
	r.Use(self.State.AuthMiddleware.ClientAuth())
	isAdmin := self.State.CourseRoleMiddleware.HasRole(entity.CoursePermissionsRoleAdmin)
	canRead := self.State.CourseRoleMiddleware.HasRole(entity.CoursePermissionsRoleRead)

	r.Post("/:courseId", isAdmin, self.SetUserPermissions)
	r.Get("/:courseId", canRead, self.GetCourseIntegrants)
	r.Delete("/:courseId", isAdmin, self.DeleteUserPermissions)
}

func (self *CoursePermissionsEndpoints) SetUserPermissions(ctx *fiber.Ctx) error {
	c := &SetUserPermissionsRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	course := &entity.Course{Model: entitycommon.Model{ID: c.Params.CourseId}}
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

func (self *CoursePermissionsEndpoints) DeleteUserPermissions(ctx *fiber.Ctx) error {
	c := &DeleteUserPermissionsRequest{}
	if err := c.bind(self.State, ctx); err != nil {
		return err
	}

	course := &entity.Course{Model: entitycommon.Model{ID: c.Params.CourseId}}
	if err := self.State.CourseRepository.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	user := &entity.User{Username: c.Query.Username}
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

	if !currentUserPermissions.Role.CanDelete(otherUserPermissions.Role) {
		return &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
	}

	if err := self.State.CoursePermissionsRepository.Delete(otherUserPermissions); err != nil {
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

	course := &entity.Course{Model: entitycommon.Model{ID: c.CourseId}}
	if err := self.State.CourseRepository.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	permissionsFindBy := &entity.CoursePermissions{CourseID: course.ID}
	preload := entity.CoursePermissionsPreloadOptions{User: true}
	permissions, err := self.State.CoursePermissionsRepository.Find(permissionsFindBy, preload, nil)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON(c.getResponse(permissions))
}
