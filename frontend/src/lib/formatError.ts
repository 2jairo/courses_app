import { ErrKind, type LocalErrorResponse } from "@/types/error"

export const getErrorMessage = (err: LocalErrorResponse): string => {
  switch (err.error) {
    case ErrKind.VideoResolutionTooLow:
      return `La resolución de video es demasiado baja. Mínimo requerido: ${err.msg.min[0]}x${err.msg.min[1]}`
    case ErrKind.InvalidVideoFormat:
      return "Formato de video inválido"
    case ErrKind.InvalidImageFormat:
      return "Formato de imagen inválido"
    case ErrKind.StoreVideo:
      return "Error al guardar el video"
    case ErrKind.StoreImage:
      return "Error al guardar la imagen"
    case ErrKind.VideoNotFound:
      return "Video no encontrado"
    case ErrKind.TooLarge:
      return "El archivo es demasiado grande"
    case ErrKind.InvalidMessageFormat:
      return "Formato de mensaje inválido"
    case ErrKind.UserAlreadyExists:
      return "El usuario ya existe"
    case ErrKind.NotLogged:
      return "Debes iniciar sesión"
    case ErrKind.Unauthorized:
      return "No autorizado"
    case ErrKind.InvalidAccessToken:
      return "Token de acceso inválido"
    case ErrKind.InvalidRefreshToken:
      return "Token de actualización inválido"
    case ErrKind.JsonRejection:
      return `JSON inválido: ${err.msg}`
    case ErrKind.QueryRejection:
      return `Parámetro de consulta inválido: ${err.msg}`
    case ErrKind.BytesRejection:
      return `Bytes inválidos: ${err.msg}`
    case ErrKind.PathRejection:
      return `Ruta inválida: ${err.msg}`
    case ErrKind.WebSocketUpgradeRejection:
      return `Error en actualización WebSocket: ${err.msg}`
    case ErrKind.MultipartRejection:
      return `Error en datos multipart: ${err.msg}`
    case ErrKind.ValidationError:
      return `Error de validación: ${Object.entries(err.msg.fields).map(([k, v]) => `${k}: ${v.join(", ")}`).join("; ")}`
    case ErrKind.BadRequest:
      return "Solicitud inválida"
    case ErrKind.Conflict:
      return "Conflicto"
    case ErrKind.Code500:
      return "Error interno del servidor"
    case ErrKind.NotFound:
      return "No encontrado"
    case ErrKind.MethodNotAllowed:
      return "Método no permitido"
    case ErrKind.RouteNotFound:
      return `Ruta no encontrada: ${err.msg.method} ${err.msg.uri}`
    default:
      return "Error desconocido"
  }

}
