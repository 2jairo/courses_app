package coursepermissions

import (
	"encoding/json"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/gofiber/fiber/v2"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type CoursePermissionsService struct {
	Repo *infrastructure.AppRepositories
}

func (s *CoursePermissionsService) SetUserPermissions(
	courseId entitycommon.Id,
	username string,
	newRole entity.CoursePermissionsRole,
	currentUserPermissions *entity.CoursePermissions,
) error {
	course := &entity.Course{Model: entitycommon.Model{ID: courseId}}
	if err := s.Repo.Course.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return global.Err(err)
	}

	otherUser := &entity.User{Username: username}
	if err := s.Repo.User.FindOne(otherUser); err != nil {
		return global.Err(err)
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
			return global.Err(err)
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
		return global.Err(err)
	}

	notificationMetadata, _ := json.Marshal(&entity.NotificationTypeCoursePermissionGrantedMetadata{
		CourseId: courseId,
		Role:     newRole,
	})
	s.Repo.Notification.Create(&entity.Notification{
		UserID:           otherUser.ID,
		ActorID:          &currentUserPermissions.UserID,
		NotificationType: entity.NotificationTypeCoursePermissionGranted,
		Metadata:         datatypes.JSON(notificationMetadata),
	})

	return nil
}

func (s *CoursePermissionsService) DeleteUserPermissions(
	courseId entitycommon.Id,
	username string,
	currentUserPermissions *entity.CoursePermissions,
) error {
	course := &entity.Course{Model: entitycommon.Model{ID: courseId}}
	if err := s.Repo.Course.FindOne(course, entity.CoursePreloadOptions{}); err != nil {
		return global.Err(err)
	}

	// Find the user whose permissions are being deleted
	user := &entity.User{Username: username}
	if err := s.Repo.User.FindOne(user); err != nil {
		return global.Err(err)
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
			return global.Err(err)
		}
	}

	// Check if current user has permission to delete this role
	if !currentUserPermissions.Role.CanDelete(otherUserPermissions.Role) {
		return &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
	}

	// Delete permissions
	if err := s.Repo.CoursePermissions.Delete(otherUserPermissions); err != nil {
		return global.Err(err)
	}

	notificationMetadata, _ := json.Marshal(&entity.NotificationTypeCoursePermissionRevokedMetadata{
		CourseId: courseId,
	})
	s.Repo.Notification.Create(&entity.Notification{
		UserID:           user.ID,
		ActorID:          &currentUserPermissions.UserID,
		NotificationType: entity.NotificationTypeCoursePermissionRevoked,
		Metadata:         datatypes.JSON(notificationMetadata),
	})

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
		return nil, global.Err(err)
	}

	return permissions, nil
}

func (s *CoursePermissionsService) GetUserPermissions(input HasRoleInput) (*entity.CoursePermissions, error) {
	if input.UserJwtClaims == nil {
		if !input.Optional {
			return nil, nil
		}
		return nil, &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
	}

	userPermissions := &entity.CoursePermissions{
		UserID:   entitycommon.Id(input.UserJwtClaims.UserId),
		CourseID: input.CourseId,
	}
	preload := entity.CoursePermissionsPreloadOptions{}

	err := s.Repo.CoursePermissions.FindOne(userPermissions, preload)
	if err != nil || !userPermissions.Role.HasRole(input.MinRole) {
		if input.Optional {
			return nil, nil
		}
		return nil, &localerror.LocalError{Err: localerror.ErrKindForbidden, Status: fiber.StatusForbidden}
	}

	return userPermissions, nil
}

func (s *CoursePermissionsService) HasRole(input HasRoleInput) error {
	_, err := s.GetUserPermissions(input)
	return global.Err(err)
}

func (s *CoursePermissionsService) HasRoleFromCourseSection(input HasRoleFromCourseSectionInput) error {
	section := &entity.CourseSection{Model: entitycommon.Model{ID: input.CourseSectionId}}
	if err := s.Repo.CourseSection.FindOne(
		section,
		entity.CourseSectionPreloadOptions{},
	); err != nil {
		return global.Err(err)
	}

	_, err := s.GetUserPermissions(HasRoleInput{
		CourseId:      section.CourseID,
		UserJwtClaims: input.UserJwtClaims,
		MinRole:       input.MinRole,
		Optional:      input.Optional,
	})
	return global.Err(err)
}
