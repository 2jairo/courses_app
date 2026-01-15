package entity

import "gorm.io/gorm"

type CoursePermissionsRole string

const (
	CoursePermissionsRoleOwner CoursePermissionsRole = "Owner"
	CoursePermissionsRoleAdmin CoursePermissionsRole = "Admin"
	CoursePermissionsRoleWrite CoursePermissionsRole = "Write"
	CoursePermissionsRoleRead  CoursePermissionsRole = "Read"
)

func (v CoursePermissionsRole) IsValid() bool {
	return CoursePermissionsRoleOwner == v || CoursePermissionsRoleAdmin == v || CoursePermissionsRoleWrite == v || CoursePermissionsRoleRead == v
}
func (v CoursePermissionsRole) CanSetRole(other CoursePermissionsRole, newRole CoursePermissionsRole) bool {
	if v != CoursePermissionsRoleOwner && v != CoursePermissionsRoleAdmin {
		return false
	}
	// owner role can't be modified 		 || can't change role if both users have role Admin
	if newRole == CoursePermissionsRoleOwner || other == CoursePermissionsRoleOwner || v == other {
		return false
	}
	return true
}

type CoursePermissions struct {
	UserID   int64                 `gorm:"type:bigint;primaryKey"`
	CourseID int64                 `gorm:"type:bigint;primaryKey"`
	Role     CoursePermissionsRole `gorm:"type:CoursePermissionsRole;not null"`

	User   User
	Course Course
}

type CoursePermissionsPreloadOptions struct {
	User   bool
	Course bool
}

func (p *CoursePermissionsPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.User {
		query.Preload(prefix + "User")
	}
	if p.Course {
		query.Preload(prefix + "Course")
	}
}
