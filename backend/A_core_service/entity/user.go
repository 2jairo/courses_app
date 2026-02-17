package entity

import (
	"database/sql/driver"
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/google/uuid"
)

type UserSex string

const (
	UserSexMale   UserSex = "Male"
	UserSexFemale UserSex = "Female"
	UserSexOther  UserSex = "Other"
)

func (us UserSex) IsValid() bool {
	return us == UserSexMale || us == UserSexFemale || us == UserSexOther
}

// Value implements driver.Valuer interface
func (us UserSex) Value() (driver.Value, error) {
	if us == "" {
		return nil, nil
	}
	return string(us), nil
}

type User struct {
	entitycommon.Model
	Version uuid.UUID `gorm:"default:uuid_generate_v4()"`

	Email        string
	Username     string
	PasswordHash string
	Avatar       *entitycommon.Path
	Banner       *entitycommon.Path
	BirthDate    time.Time
	Sex          UserSex `gorm:"type:UserSex"`

	// relations
	// Avatar         *File            `gorm:"foreignKey:AvatarFileID;references:ID"`
	// Banner         *File            `gorm:"foreignKey:BannerFileID;references:ID"`
	Files          []File           `gorm:"foreignKey:UserID"`
	CoursesProgess []CourseProgress `gorm:"foreignKey:UserID"`
}
