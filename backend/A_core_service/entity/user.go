package entity

import (
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

type User struct {
	entitycommon.Model
	Version uuid.UUID `gorm:"type:uuid;not null;default:uuid_generate_v4()"`

	Email        string             `gorm:"type:varchar(100);not null"`
	Username     string             `gorm:"type:varchar(50);not null"`
	PasswordHash string             `gorm:"type:varchar(100);not null"`
	Avatar       *entitycommon.Path `gorm:"type:varchar(50)"`
	Banner       *entitycommon.Path `gorm:"type:varchar(50)"`
	BirthDate    time.Time          `gorm:"type:date;not null"`
	Sex          UserSex            `gorm:"type:UserSex;not null"`

	// relations
	Files []File `gorm:"foreignKey:UserID"`
}
