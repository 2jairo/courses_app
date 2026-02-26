import type { CoursePermissionsRole } from "@/types/common/coursePermissions"
import type { CourseLecturesAccesibility, CourseVisibility } from "@/types/common/courses"
import type { FileKind, FileStatus } from "@/types/common/files"
import type { LectureKind, LectureVisibility } from "@/types/common/lectures"
import type { QuizQuestionKind, QuizQuestionStatus } from "@/types/common/quizzesQuestions"
import type { BrowserType, DeviceType, OperatingSystem } from "@/types/client/auth"

// CourseVisibility
export const formatCourseVisibility = (v: CourseVisibility) => {
  switch (v) {
    case "Link": return "Por link"
    case "Private": return "Privado"
    case "Public": return "Público"
  }
}

export const formatCourseLectureAccesibility = (v: CourseLecturesAccesibility) => {
  switch (v) {
    case "Open": return "Abierta"
    case "Section": return "Por sección"
    case "QuizOrLab": return "Por cuestionario o laboratorio"
    case "Closed": return "Cerrada"
  }
}

// CoursePermissionsRole
export const formatCoursePermissionsRole = (role: CoursePermissionsRole) => {
  switch (role) {
    case "Owner": return "Propietario"
    case "Admin": return "Administrador"
    case "Write": return "Escritura"
    case "Read": return "Lectura"
  }
}

// LectureVisibility
export const formatLectureVisibility = (v: LectureVisibility) => {
  switch (v) {
    case "Link": return "Por link"
    case "Private": return "Privado"
    case "Public": return "Público"
  }
}

// LectureKind
export const formatLectureKind = (kind: LectureKind) => {
  switch (kind) {
    case "Video": return "Vídeo"
    case "Document": return "Documento"
    case "Quiz": return "Cuestionario"
    case "Lab": return "Laboratorio"
  }
}

// QuizQuestionKind
export const formatQuizQuestionKind = (kind: QuizQuestionKind) => {
  switch (kind) {
    case "BoolMultiple": return "Verdadero/Falso (Múltiple)"
    case "BoolSingle": return "Verdadero/Falso (Única)"
    case "TextMultiple": return "Respuesta (Múltiple)"
    case "TextSingle": return "Respuesta (Única)"
    case "Match": return "Emparejar"
    case "Ordering": return "Ordenar"
  }
}

// QuizQuestionStatus
export const formatQuizQuestionStatus = (status: QuizQuestionStatus) => {
  switch (status) {
    case "Public": return "Pública"
    case "Private": return "Privada"
  }
}


export const formatFileStatus = (kind: FileStatus) => {
  switch (kind) {
    case "Pending": return "Pendiente"
    case "Processing": return "Procesando"
    case "Ready": return "Listo"
    case "Failed": return "Fallido"
  }
}

export const formatFileKind = (kind: FileKind) => {
  switch (kind) {
    case "Image": return "Imagen"
    case "Video": return "Vídeo"
    case "Other": return "Otro"
  }
}

export const getFileStatusVariant = (status: FileStatus) => {
  switch (status) {
    case "Pending":
      return "secondary"
    case "Processing":
      return "outline"
    case "Ready":
      return "default"
    case "Failed":
      return "destructive"
  }
}




export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}


export const formatFileSize = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 B"
  
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, decimals)) / Math.pow(10, decimals) + " " + sizes[i]
}

export const formatDuration = (seconds: number, withSuffix = false) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (hrs > 0) {
    const time = `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    return withSuffix ? `${time}h` : time
  }
  
  const time = `${mins}:${secs.toString().padStart(2, "0")}`
  return withSuffix ? `${mins}m ${secs}s` : time
}

export const timeSince = (dateString: string) => {
  const ms = Date.now() - new Date(dateString).getTime()
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `hace ${years} año${years > 1 ? 's' : ''}`
  if (months > 0) return `hace ${months} mes${months > 1 ? 'es' : ''}`
  if (weeks > 0) return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`
  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
  return `hace ${seconds} segundo${seconds > 1 ? 's' : ''}`
}

export const videoResolutionPretty = (height: number): string => {
  if (height >= 2160) return "4K"
  if (height >= 1440) return "2K"
  if (height >= 1080) return "FHD"
  if (height >= 720) return "HD"
  if (height >= 480) return "SD"
  return ""
}

export const formatLanguage = (lang: string) => {
  switch (lang) {
    case "es": return "Español"
    case "en": return "Inglés"
    case "fr": return "Francés"  
    case "de": return "Alemán"
    case "it": return "Italiano"
    case "pt": return "Portugués"
    case "ru": return "Ruso"
    case "zh": return "Chino"
    case "ja": return "Japonés"
    case "ko": return "Coreano"
    case "ar": return "Árabe"
    case "hi": return "Hindi"
    case "nl": return "Holandés"
    default: return lang
  }
}

export const formatViews = (views: number) => {
  if (views < 1000) return `${views}`
  if (views < 1_000_000) return `${(views / 1000).toFixed(1).replace(/\.0$/, "")} mil`
  if (views < 1_000_000_000) return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, "")} M`
  return `${(views / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} B`
}

export function calculateProgress(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

// Session
export const formatBrowser = (browser: BrowserType) => {
  switch (browser) {
    case "Chrome": return "Chrome"
    case "Safari": return "Safari"
    case "Firefox": return "Firefox"
    case "Edge": return "Microsoft Edge"
    case "InternetExplorer": return "Internet Explorer"
    case "Opera": return "Opera"
    case "Brave": return "Brave"
    case "Other": return "Navegador desconocido"
  }
}

export const formatOs = (os: OperatingSystem) => {
  switch (os) {
    case "Windows": return "Windows"
    case "MacOS": return "macOS"
    case "IOS": return "iOS"
    case "Android": return "Android"
    case "Linux": return "Linux"
    case "ChromeOS": return "Chrome OS"
    case "Other": return "SO desconocido"
  }
}

export const formatDeviceType = (device: DeviceType) => {
  switch (device) {
    case "Desktop": return "Escritorio"
    case "Mobile": return "Móvil"
    case "Tablet": return "Tablet"
    case "SmartTv": return "Smart TV"
    case "Other": return "Dispositivo desconocido"
  }
}