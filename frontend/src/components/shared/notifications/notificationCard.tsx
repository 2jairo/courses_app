import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/shared/userAvatar/userAvatar"
import {
  formatBrowser,
  formatCoursePermissionsRole,
  formatCourseVisibility,
  formatDate,
  formatOrderStatus,
  formatOs,
  timeSince,
} from "@/lib/format"
import { cn } from "@/lib/utils"
import type { NotificationResponse } from "@/types/client/notifications"

interface NotificationCardProps {
  notification: NotificationResponse
}

const getNotificationMessage = (notification: NotificationResponse) => {
  switch (notification.notificationType) {
    case "LectureCommentReply":
      return {
        title: "Nueva respuesta a tu comentario",
        description: "Alguien respondió en uno de tus comentarios.",
      }

    case "LectureCommentReplyFromStaff":
      return {
        title: "Respuesta del staff",
        description: "Un miembro del staff respondió a tu comentario.",
      }

    case "CoursePermissionGranted":
      return {
        title: "Permiso de curso otorgado",
        description: `Tu rol ahora es ${formatCoursePermissionsRole(notification.metadata.role)}.`,
      }

    case "CoursePermissionRevoked":
      return {
        title: "Permiso de curso revocado",
        description: "Tu acceso a un curso fue revocado.",
      }

    case "CourseVisibilityUpdated":
      return {
        title: "Visibilidad del curso actualizada",
        description: notification.metadata.visibility
          ? `Nueva visibilidad: ${formatCourseVisibility(notification.metadata.visibility)}.`
          : "La visibilidad del curso fue modificada.",
      }

    case "LecturePublished":
      return {
        title: "Nueva clase publicada",
        description: "Se publicó una nueva clase en un curso que sigues.",
      }

    case "NotificationStatusUpdated":
      return {
        title: "Estado de orden actualizado",
        description: `La orden está ${formatOrderStatus(notification.metadata.orderStatus).toLowerCase()}.`,
      }

    case "SessionNewLocation":
      return {
        title: "Inicio de sesión desde nueva ubicación",
        description: `${notification.metadata.location} • ${formatBrowser(notification.metadata.ua.browser)} en ${formatOs(notification.metadata.ua.os)}.`,
      }

    case "CourseDiscountAvailable":
      return {
        title: `Descuento del ${notification.metadata.discountPercent}% disponible`,
        description: `Válido hasta ${formatDate(notification.metadata.validUntil)}.`,
      }

    case "CourseMaterialUpdated":
      return {
        title: "Material del curso actualizado",
        description: `Se detectó una actualización de tipo: ${notification.metadata.updateType}.`,
      }

    case "QuizScoreAvailable":
      return {
        title: notification.metadata.passed ? "Aprobaste un quiz" : "Resultado de quiz disponible",
        description: `Puntaje: ${notification.metadata.score}/${notification.metadata.maxScore}.`,
      }

    default:
      return {
        title: "Nueva notificación",
        description: "Tienes una actualización reciente.",
      }
  }
}

export const NotificationCard = ({ notification }: NotificationCardProps) => {
  const actorName = notification.actor?.username || "Sistema"
  const { title, description } = getNotificationMessage(notification)

  return (
    <article
      className={cn(
        "flex gap-3 p-4 transition-colors",
        notification.seen ? "bg-card" : "bg-primary/5"
      )}
    >
      <UserAvatar
        username={notification.actor?.username}
        avatar={notification.actor?.avatar}
        className="h-10 w-10"
      />

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-5">{title}</p>
          {!notification.seen && <Badge variant="secondary">Nuevo</Badge>}
        </div>

        <p className="text-sm text-muted-foreground">{description}</p>

        <p className="text-xs text-muted-foreground">
          {actorName}
          {notification.seenAt ? ` • ${timeSince(notification.seenAt)} • ${formatDate(notification.seenAt)}` : " • Sin leer"}
        </p>
      </div>
    </article>
  )
}
