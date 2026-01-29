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
func (v CoursePermissionsRole) getRoleRank() map[CoursePermissionsRole]int {
	return map[CoursePermissionsRole]int{
		CoursePermissionsRoleOwner: 4,
		CoursePermissionsRoleAdmin: 3,
		CoursePermissionsRoleWrite: 2,
		CoursePermissionsRoleRead:  1,
	}
}

func (v CoursePermissionsRole) CanSetRole(other CoursePermissionsRole, newRole CoursePermissionsRole) bool {
	roleRank := v.getRoleRank()

	return roleRank[v] >= roleRank[CoursePermissionsRoleAdmin] && // at least admin
		roleRank[v] > roleRank[other] && // other role has to be lower
		newRole != CoursePermissionsRoleOwner && // can't assign owner
		(newRole != CoursePermissionsRoleAdmin || v == CoursePermissionsRoleOwner) // only owner can promote to admin
}

func (v CoursePermissionsRole) CanDelete(other CoursePermissionsRole) bool {
	roleRank := v.getRoleRank()
	return roleRank[v] >= roleRank[CoursePermissionsRoleAdmin] && roleRank[v] > roleRank[other]
}

func (v CoursePermissionsRole) HasRole(role CoursePermissionsRole) bool {
	roleRank := v.getRoleRank()
	return roleRank[v] >= roleRank[role]
}

type CoursePermissions struct {
	DeletedAt gorm.DeletedAt        `gorm:"type:timestamptz"`
	UserID    int64                 `gorm:"type:bigint;primaryKey"`
	CourseID  int64                 `gorm:"type:bigint;primaryKey"`
	Role      CoursePermissionsRole `gorm:"type:CoursePermissionsRole;not null"`

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
