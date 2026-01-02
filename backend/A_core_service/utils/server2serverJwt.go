package utils

import (
	"fmt"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/golang-jwt/jwt/v5"
)

type S2SJwtRepository struct {
	iat   int64
	token string
}

func NewS2SJwtRepository() *S2SJwtRepository {
	self := S2SJwtRepository{}
	self.GenerateToken()

	return &self
}

func (self *S2SJwtRepository) GetToken() string {
	// 5min margin
	if time.Now().Unix() >= self.iat+(config.S2SJwtHours*3600)-300 {
		self.GenerateToken()
	}
	return self.token
}

func (self *S2SJwtRepository) GenerateToken() {
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	iat := time.Now().Unix()

	claims["iat"] = iat
	claims["exp"] = time.Now().Add(time.Hour * time.Duration(config.S2SJwtHours)).Unix()

	S2SToken, _ := token.SignedString(config.S2SJwtSecret)

	self.token = fmt.Sprintf("Bearer %s", S2SToken)
	self.iat = iat
}
