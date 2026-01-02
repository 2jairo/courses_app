package localerror

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
)

type LocalErrKind string

const (
	// media
	ErrKindVideoResolutionTooLow LocalErrKind = "VideoResolutionTooLow"
	ErrKindInvalidVideoFormat    LocalErrKind = "InvalidVideoFormat"
	ErrKindInvalidImageFormat    LocalErrKind = "InvalidImageFormat"
	ErrKindStoreVideo            LocalErrKind = "StoreVideo"
	ErrKindStoreImage            LocalErrKind = "StoreImage"
	ErrKindVideoNotFound         LocalErrKind = "VideoNotFound"

	// auth
	ErrKindUserAlreadyExists   LocalErrKind = "UserAlreadyExists"
	ErrKindNotLogged           LocalErrKind = "NotLogged"
	ErrKindUnauthorized        LocalErrKind = "Unauthorized"
	ErrKindInvalidAccessToken  LocalErrKind = "InvalidAccessToken"
	ErrKindInvalidRefreshToken LocalErrKind = "InvalidRefreshToken"

	// extract
	ErrKindJsonRejection             LocalErrKind = "JsonRejection"
	ErrKindQueryRejection            LocalErrKind = "QueryRejection"
	ErrKindBytesRejection            LocalErrKind = "BytesRejection"
	ErrKindPathRejection             LocalErrKind = "PathRejection"
	ErrKindWebSocketUpgradeRejection LocalErrKind = "WebSocketUpgradeRejection"
	ErrKindMultipartRejection        LocalErrKind = "MultipartRejection"
	ErrKindValidationError           LocalErrKind = "ErrKindValidationError"

	ErrKindCode500          LocalErrKind = "Code500"
	ErrKindRouteNotFound    LocalErrKind = "RouteNotFound"
	ErrKindMethodNotAllowed LocalErrKind = "MethodNotAllowed"
	ErrKindNotFound         LocalErrKind = "NotFound"
)

func (kind LocalErrKind) HasPayload() bool {
	hasPayload := []LocalErrKind{
		ErrKindValidationError,
		ErrKindNotFound,
		ErrKindVideoResolutionTooLow,
		ErrKindJsonRejection,
		ErrKindQueryRejection,
		ErrKindBytesRejection,
		ErrKindPathRejection,
		ErrKindWebSocketUpgradeRejection,
		ErrKindMultipartRejection,
	}

	for _, k := range hasPayload {
		if k == kind {
			return true
		}
	}
	return false
}

type LocalError struct {
	Err    LocalErrKind `json:"error"`
	Msg    interface{}  `json:"msg,omitempty"`
	Status int          `json:"-"`
}

func Default() LocalError {
	return LocalError{
		Err:    ErrKindCode500,
		Status: fiber.StatusInternalServerError,
	}
}

func (e *LocalError) Error() string {
	return string(e.Err)
}

func ErrorHandler(ctx *fiber.Ctx, err error) error {
	localErr := Default()

	if e, ok := err.(*fiber.Error); ok {
		localErr = handleFiberError(ctx, e)
	}
	if e, ok := err.(*LocalError); ok {
		localErr = *e
	}

	fmt.Printf("localErr: %v\n", localErr)
	return ctx.Status(localErr.Status).JSON(localErr)
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

	return Default()
}
