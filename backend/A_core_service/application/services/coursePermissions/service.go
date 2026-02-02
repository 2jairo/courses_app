package coursepermissions

import (
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CoursePermissionsService struct {
	Repo *infrastructure.AppRepositories
}

func (s *CoursePermissionsService) SetUserPermissions(
	courseId entitycommon.Id,
	username string,
	newRole entity.CoursePermissionsRole,
	currentUserId entitycommon.Id,
) error {
	course := &entity.Course{Model: entitycommon.Model{ID: courseId}}
	if err := s.Repo.Course.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return err
	}

	otherUser := &entity.User{Username: username}
	if err := s.Repo.User.FindOne(otherUser); err != nil {
		return err
	}

	// Get current user's permissions
	currentUserPermissions := &entity.CoursePermissions{
		UserID:   currentUserId,
		CourseID: courseId,
	}
	if err := s.Repo.CoursePermissions.FindOne(
		currentUserPermissions,
		entity.CoursePermissionsPreloadOptions{},
	); err != nil {
		return err
	}

	// Get target user's existing permissions
	otherUserPermissions := &entity.CoursePermissions{
		UserID:   otherUser.ID,
		CourseID: courseId,
	}
	if err := s.Repo.CoursePermissions.FindOne(
		otherUserPermissions,
		entity.CoursePermissionsPreloadOptions{},
	); err != nil {
		if err == gorm.ErrRecordNotFound {
			otherUserPermissions.Role = entity.CoursePermissionsRoleRead
		} else {
			return err
		}
	}

	// Check if current user has permission to set this role
	if !currentUserPermissions.Role.CanSetRole(otherUserPermissions.Role, newRole) {
		return &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
	}

	// Create/update permissions
	permissions := &entity.CoursePermissions{
		UserID:   otherUser.ID,
		CourseID: courseId,
		Role:     newRole,
	}
	if err := s.Repo.CoursePermissions.Create(permissions); err != nil {
		return err
	}

	return nil
}

func (s *CoursePermissionsService) DeleteUserPermissions(
	courseId entitycommon.Id,
	username string,
	currentUserId entitycommon.Id,
) error {
	course := &entity.Course{Model: entitycommon.Model{ID: courseId}}
	if err := s.Repo.Course.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return err
	}

	// Find the user whose permissions are being deleted
	user := &entity.User{Username: username}
	if err := s.Repo.User.FindOne(user); err != nil {
		return err
	}

	// Get current user's permissions
	currentUserPermissions := &entity.CoursePermissions{
		UserID:   currentUserId,
		CourseID: courseId,
	}
	if err := s.Repo.CoursePermissions.FindOne(
		currentUserPermissions,
		entity.CoursePermissionsPreloadOptions{},
	); err != nil {
		return err
	}

	// Get target user's permissions
	otherUserPermissions := &entity.CoursePermissions{
		UserID:   user.ID,
		CourseID: courseId,
	}
	if err := s.Repo.CoursePermissions.FindOne(
		otherUserPermissions,
		entity.CoursePermissionsPreloadOptions{},
	); err != nil {
		if err == gorm.ErrRecordNotFound {
			otherUserPermissions.Role = entity.CoursePermissionsRoleRead
		} else {
			return err
		}
	}

	// Check if current user has permission to delete this role
	if !currentUserPermissions.Role.CanDelete(otherUserPermissions.Role) {
		return &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
	}

	// Delete permissions
	if err := s.Repo.CoursePermissions.Delete(otherUserPermissions); err != nil {
		return err
	}

	return nil
}

// GetCourseIntegrants retrieves all users with permissions for a course
func (s *CoursePermissionsService) GetCourseIntegrants(
	courseId entitycommon.Id,
) ([]entity.CoursePermissions, error) {
	// Verify course exists
	course := &entity.Course{Model: entitycommon.Model{ID: courseId}}
	if err := s.Repo.Course.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return nil, &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	// Get all permissions for the course
	permissionsFindBy := &entity.CoursePermissions{CourseID: courseId}
	preload := entity.CoursePermissionsPreloadOptions{User: true}
	permissions, err := s.Repo.CoursePermissions.Find(permissionsFindBy, preload, nil)
	if err != nil {
		return nil, err
	}

	return permissions, nil
}
