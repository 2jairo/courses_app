package localerror

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

func handleValidationErrors(_ *fiber.Ctx, err validator.ValidationErrors) LocalError {
	fields := map[string][]string{}

	for _, e := range err {
		field := e.Field()

		if _, ok := fields[field]; !ok {
			fields[field] = []string{}
		}
		fields[field] = append(fields[field], e.Tag())
	}

	return LocalError{
		Err:    ErrKindValidationError,
		Status: fiber.StatusUnprocessableEntity,
		Msg: PayloadValidationRejection{
			Fields: fields,
		},
	}
}

func handleFiberError(ctx *fiber.Ctx, e *fiber.Error) LocalError {
	switch e.Code {
	case fiber.StatusNotFound:
		return LocalError{
			Err: ErrKindRouteNotFound,
			Msg: PayloadRouteNotFound{
				URI:    ctx.Path(),
				Method: ctx.Method(),
			},
			Status: fiber.StatusNotFound,
		}
	case fiber.StatusMethodNotAllowed:
		return LocalError{
			Err:    ErrKindMethodNotAllowed,
			Status: fiber.StatusMethodNotAllowed,
		}
	}

	return LocalError{
		Err:    ErrKindCode500,
		Status: e.Code,
		Msg:    e.Message,
	}
}
