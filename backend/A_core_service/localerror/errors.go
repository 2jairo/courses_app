package localerror

import (
	"encoding/json"
	"fmt"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/go-playground/validator/v10"
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
	ErrKindVideoNotReady         LocalErrKind = "VideoNotReady"
	ErrKindTooLarge              LocalErrKind = "TooLarge"
	ErrKindInvalidMessageFormat  LocalErrKind = "InvalidMessageFormat"

	// quizzes
	ErrKindAtLeastOneCorrect LocalErrKind = "AtLeastOneCorrect"
	ErrKindOnlyOneCorrect    LocalErrKind = "OnlyOneCorrect"
	ErrKindAtLeastOneKeyword LocalErrKind = "AtLeastOneKeyword"
	ErrKindAtLeastTwoItems   LocalErrKind = "AtLeastTwoItems"
	ErrKindAttemptEnded      LocalErrKind = "AttemptEnded"
	ErrKindAttemptNotEnded   LocalErrKind = "AttemptNotEnded"

	// courses
	ErrKindLectureBlocked LocalErrKind = "LectureBlocked"

	// lecture comments
	ErrKindReplyOfReply LocalErrKind = "ReplyOfReply"

	// shopping cart
	ErrKindIsFree          LocalErrKind = "IsFree"
	ErrKindAlredyPurchased LocalErrKind = "AlredyPurchased"
	ErrKindAlredyRedeemed  LocalErrKind = "AlredyRedeemed"

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
	ErrKindValidationError           LocalErrKind = "ValidationError"

	// other
	ErrKindBadRequest       LocalErrKind = "BadRequest"
	ErrKindConflict         LocalErrKind = "Conflict"
	ErrKindCode500          LocalErrKind = "Code500"
	ErrKindNotFound         LocalErrKind = "NotFound"
	ErrKindMethodNotAllowed LocalErrKind = "MethodNotAllowed"
	ErrKindRouteNotFound    LocalErrKind = "RouteNotFound"
	ErrKindForbidden        LocalErrKind = "Forbidden"
)

func (kind LocalErrKind) HasPayload() bool {
	hasPayload := []LocalErrKind{
		ErrKindValidationError,
		ErrKindRouteNotFound,
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

func FromHttp(body []byte, status int) (*LocalError, error) {
	var localErr LocalError

	if err := json.Unmarshal(body, &localErr); err != nil {
		return nil, err
	}
	localErr.Status = status

	return &localErr, nil
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
	fmt.Printf("err: %v\n", err)
	localErr := trySpecificError(ctx, err)

	if config.Env == config.EnvironmentDevelopment && localErr.Err.HasPayload() && localErr.Msg == nil {
		panic(fmt.Sprintf("LocalError with kind %s must have a payload message", localErr.Err))
	}

	return ctx.Status(localErr.Status).JSON(localErr)
}

func trySpecificError(ctx *fiber.Ctx, err error) LocalError {
	if e, ok := err.(*fiber.Error); ok {
		return handleFiberError(ctx, e)
	}
	if e, ok := err.(*LocalError); ok {
		return *e
	}
	if e, ok := err.(validator.ValidationErrors); ok {
		return handleValidationErrors(ctx, e)
	}

	return Default()
}
