package utils

import (
	"time"

	"github.com/google/uuid"
)

type ClientJwtClaims struct {
	UserId    int64              `json:"user_id"`
	Version   uuid.UUID          `json:"version"`
	Analytics ClientJwtAnalytics `json:"analytics"`
}

type UserSex string

const (
	SexMale   UserSex = "male"
	SexFemale UserSex = "female"
	SexOther  UserSex = "other"
)

type ClientJwtAnalytics struct {
	Sex       UserSex   `json:"sex"`
	BirthDate time.Time `json:"birth_date"`
}
