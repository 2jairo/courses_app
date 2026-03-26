import { ErrKind, type LocalErrorResponse } from "@/types/error"

export const getErrorMessage = (err: LocalErrorResponse): string => {
  switch (err.error) {
    // media
    case ErrKind.VideoResolutionTooLow:
      return `La resolución del video (${err.msg.resolution[0]}×${err.msg.resolution[1]}) es demasiado baja. Se requiere al menos ${err.msg.min[0]}×${err.msg.min[1]}`
    case ErrKind.InvalidVideoFormat:
      return "El formato del video no es compatible"
    case ErrKind.InvalidImageFormat:
      return "El formato de la imagen no es compatible"
    case ErrKind.StoreVideo:
      return "No se pudo guardar el video. Inténtalo de nuevo"
    case ErrKind.StoreImage:
      return "No se pudo guardar la imagen. Inténtalo de nuevo"
    case ErrKind.VideoNotFound:
      return "El video no fue encontrado"
    case ErrKind.VideoNotReady:
      return "El video aún se está procesando. Espera unos momentos"
    case ErrKind.TooLarge:
      return "El archivo supera el tamaño máximo permitido"
    case ErrKind.InvalidMessageFormat:
      return "El formato del mensaje no es válido"

    // quizzes
    case ErrKind.AtLeastOneCorrect:
      return "Debe marcarse al menos una respuesta como correcta"
    case ErrKind.OnlyOneCorrect:
      return "Solo puede haber una respuesta correcta para este tipo de pregunta"
    case ErrKind.AtLeastOneKeyword:
      return "Añade al menos una palabra clave"
    case ErrKind.AtLeastTwoItems:
      return "Se necesitan al menos dos elementos"
    case ErrKind.AttemptEnded:
      return "El tiempo del intento ha expirado"

    // courses
    case ErrKind.LectureBlocked:
      return "Esta lección está bloqueada. Completa las anteriores para desbloquearla"

    // lecture comments
    case ErrKind.ReplyOfReply:
      return "No puedes responder a una respuesta de un comentario"

    // shopping cart
    case ErrKind.IsFree:
      return "No puedes añadir al carrito un curso gratuito"
    case ErrKind.AlredyPurchased:
      return "No puedes añadir al carrito un curso que ya has comprado"

    // auth
    case ErrKind.UserAlreadyExists:
      return "Ya existe una cuenta con ese nombre de usuario o correo"
    case ErrKind.NotLogged:
      return "Debes iniciar sesión para continuar"
    case ErrKind.Unauthorized:
      return "No tienes permiso para realizar esta acción"
    case ErrKind.InvalidAccessToken:
      return "Tu sesión ha expirado. Vuelve a iniciar sesión"
    case ErrKind.InvalidRefreshToken:
      return "Tu sesión no es válida. Vuelve a iniciar sesión"

    // extract (string-associated)
    case ErrKind.JsonRejection:
      return `Datos enviados con formato incorrecto: ${err.msg}`
    case ErrKind.QueryRejection:
      return `Parámetro de búsqueda inválido: ${err.msg}`
    case ErrKind.BytesRejection:
      return `Error al procesar el archivo: ${err.msg}`
    case ErrKind.PathRejection:
      return `URL inválida: ${err.msg}`
    case ErrKind.WebSocketUpgradeRejection:
      return `No se pudo establecer la conexión en tiempo real: ${err.msg}`
    case ErrKind.MultipartRejection:
      return `Error al procesar los datos del formulario: ${err.msg}`

    // extract (structured)
    case ErrKind.ValidationError:
      return `Datos inválidos: ${Object.entries(err.msg.fields).map(([k, v]) => `${k}: ${v.join(", ")}`).join("; ")}`
    
    // other
    case ErrKind.BadRequest:
      return "La solicitud no es válida"
    case ErrKind.Conflict:
      return "Ya existe un recurso con esos datos"
    case ErrKind.Code500:
      return "Error interno del servidor. Inténtalo más tarde"
    case ErrKind.NotFound:
      return "El recurso solicitado no fue encontrado"
    case ErrKind.MethodNotAllowed:
      return "Operación no permitida"
    case ErrKind.RouteNotFound:
      return `Ruta no encontrada: ${err.msg.method} ${err.msg.uri}`
    case ErrKind.Forbidden:
      return "No tienes acceso a este recurso"
    case ErrKind.Status0:
    default:
      return "No se pudo conectar con el servidor. Comprueba tu conexión"
  }

}
