package middleware

import (
	"bytes"
	"encoding/json"
	"net/http"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
)

type AuthMiddleware struct {
	S2SJwt *utils.S2SJwtRepository
}

func (self *AuthMiddleware) ClientAuth() fiber.Handler {
	s2sToken := self.S2SJwt.GetToken()

	return func(c *fiber.Ctx) error {
		clientToken := c.Get("Authorization")

		if clientToken == "" || clientToken[:7] != "Bearer " {
			return &localerror.LocalError{Err: localerror.ErrKindUnauthorized, Status: fiber.StatusUnauthorized}
		}

		req, _ := http.NewRequest(
			http.MethodPost,
			config.BServiceUrl.AuthClaims(),
			bytes.NewBuffer(nil),
		)
		req.Header.Set("Authorization", clientToken)
		req.Header.Set("s2s_authorization", s2sToken)
		req.Header.Set("Accept", "application/json")

		client := &http.Client{
			Timeout: 3 * time.Second,
		}

		resp, err := client.Do(req)
		if err != nil {
			return &localerror.LocalError{Err: localerror.ErrKindCode500, Status: fiber.StatusInternalServerError}
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return &localerror.LocalError{Err: localerror.ErrKindUnauthorized, Status: fiber.StatusUnauthorized}
		}

		var claims utils.ClientJwtClaims
		json.NewDecoder(resp.Body).Decode(&claims)

		c.Locals(LocalsMwJwtClaims, &claims)

		return c.Next()
	}
}
