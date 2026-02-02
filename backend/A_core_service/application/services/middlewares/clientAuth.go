package middlewares

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

type ClientAuthParams struct {
	Optional bool
}

func (self *MiddlewareService) ClientAuth(params ...ClientAuthParams) fiber.Handler {
	s2sToken := self.Utils.S2SJwt.GetToken()

	conf := ClientAuthParams{}
	for _, param := range params {
		if param.Optional {
			conf.Optional = param.Optional
		}
	}

	return func(c *fiber.Ctx) error {
		clientToken := c.Get("Authorization")

		if clientToken == "" || clientToken[:7] != "Bearer " {
			if !conf.Optional {
				return &localerror.LocalError{Err: localerror.ErrKindUnauthorized, Status: fiber.StatusUnauthorized}
			}
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
			if conf.Optional {
				return c.Next()
			}

			return &localerror.LocalError{
				Err:    localerror.ErrKindCode500,
				Status: fiber.StatusInternalServerError,
				Msg:    "Failed to contact auth service",
			}
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			if conf.Optional {
				return c.Next()
			}

			return &localerror.LocalError{Err: localerror.ErrKindUnauthorized, Status: fiber.StatusUnauthorized}
		}

		var claims utils.ClientJwtClaims
		json.NewDecoder(resp.Body).Decode(&claims)

		c.Locals(localsMwJwtClaims, &claims)

		return c.Next()
	}
}
