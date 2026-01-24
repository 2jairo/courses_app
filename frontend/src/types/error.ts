export enum ErrKind {
  // media
  VideoResolutionTooLow = "VideoResolutionTooLow",
  InvalidVideoFormat = "InvalidVideoFormat",
  InvalidImageFormat = "InvalidImageFormat",
  StoreVideo = "StoreVideo",
  StoreImage = "StoreImage",
  VideoNotFound = "VideoNotFound",
  TooLarge = "TooLarge",
  InvalidMessageFormat = "InvalidMessageFormat",

  // auth
  UserAlreadyExists = "UserAlreadyExists",
  NotLogged = "NotLogged",
  Unauthorized = "Unauthorized",
  InvalidAccessToken = "InvalidAccessToken",
  InvalidRefreshToken = "InvalidRefreshToken",

  // extract
  JsonRejection = "JsonRejection",
  QueryRejection = "QueryRejection",
  BytesRejection = "BytesRejection",
  PathRejection = "PathRejection",
  WebSocketUpgradeRejection = "WebSocketUpgradeRejection",
  MultipartRejection = "MultipartRejection",
  ValidationError = "ValidationError",

  // other
  BadRequest = "BadRequest",
  Conflict = "Conflict",
  Code500 = "Code500",
  NotFound = "NotFound",
  MethodNotAllowed = "MethodNotAllowed",
  RouteNotFound = "RouteNotFound",
  Forbidden = "Forbidden",

  // only frontend
  Status0 = 'Status0' // server down | no connection
}

type ErrMsgValidationRejection = {
	fields: { [key: string]: string[] }
}

type ErrMsgRouteNotFound = {
  uri: string;
  method: string;
}

type ErrMsgVideoResolutionTooLow = {
  resolution: [number, number];
  min: [number, number];
}

type ErrMsgJsonRejection = string

type ErrMsgQueryRejection = string

type ErrMsgBytesRejection = string

type ErrMsgPathRejection = string

type ErrMsgWebSocketUpgradeRejection = string

type ErrMsgMultipartRejection = string


export type LocalErrorResponse =
  // media
  | { error: ErrKind.VideoResolutionTooLow, msg: ErrMsgVideoResolutionTooLow }
  | { error: ErrKind.InvalidVideoFormat }
  | { error: ErrKind.InvalidImageFormat }
  | { error: ErrKind.StoreVideo }
  | { error: ErrKind.StoreImage }
  | { error: ErrKind.VideoNotFound }
  | { error: ErrKind.TooLarge }
  | { error: ErrKind.InvalidMessageFormat }

  // auth
  | { error: ErrKind.UserAlreadyExists }
  | { error: ErrKind.NotLogged }
  | { error: ErrKind.Unauthorized }
  | { error: ErrKind.InvalidAccessToken }
  | { error: ErrKind.InvalidRefreshToken }

  // extract (string-associated)
  | { error: ErrKind.JsonRejection, msg: ErrMsgJsonRejection }
  | { error: ErrKind.QueryRejection, msg: ErrMsgQueryRejection }
  | { error: ErrKind.BytesRejection, msg: ErrMsgBytesRejection }
  | { error: ErrKind.PathRejection, msg: ErrMsgPathRejection }
  | { error: ErrKind.WebSocketUpgradeRejection, msg: ErrMsgWebSocketUpgradeRejection }
  | { error: ErrKind.MultipartRejection, msg: ErrMsgMultipartRejection }

  // extract (structured)
  | { error: ErrKind.ValidationError, msg: ErrMsgValidationRejection }

  // other
  | { error: ErrKind.BadRequest }
  | { error: ErrKind.Conflict }
  | { error: ErrKind.Code500 }
  | { error: ErrKind.NotFound }
  | { error: ErrKind.MethodNotAllowed }
  | { error: ErrKind.RouteNotFound, msg: ErrMsgRouteNotFound }
  | { error: ErrKind.Forbidden }
  | { error: ErrKind.Status0 }