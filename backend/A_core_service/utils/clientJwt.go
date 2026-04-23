package utils

import (
	"time"
)

type ClientJwtClaims struct {
	UserId         int64              `json:"user_id"`
	SessionVersion int64              `json:"session_version"`
	FamilyId       string             `json:"family_id"`
	Analytics      ClientJwtAnalytics `json:"analytics"`
}

type UserSex string

const (
	UserSexMale   UserSex = "Male"
	UserSexFemale UserSex = "Female"
	UserSexOther  UserSex = "Other"
)

func (us UserSex) IsValid() bool {
	return us == UserSexMale || us == UserSexFemale || us == UserSexOther
}

type ClientJwtAnalytics struct {
	Sex       UserSex   `json:"sex" validate:"enum"`
	BirthDate time.Time `json:"birth_date"`
	Country   string    `json:"country"`
	City      string    `json:"city"`
}
