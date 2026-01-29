import type { CoursePermissionsRole } from "@/types/common/coursePermissions"
import type { CourseVisibility } from "@/types/common/courses"
import type { FileKind, FileStatus } from "@/types/common/files"
import type { LectureKind, LectureVisibility } from "@/types/common/lectures"

// CourseVisibility
export const formatCourseVisibility = (v: CourseVisibility) => {
  switch (v) {
    case "Link": return "Por link"
    case "Private": return "Privado"
    case "Public": return "Público"
  }
}
export const getCourseVisibilityVariant = (v: CourseVisibility) => {
  switch (v) {
    case "Link": return "secondary"
    case "Private": return "secondary"
    case "Public": return "default"
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
export const getCoursePermissionsRoleVariant = (role: CoursePermissionsRole) => {
  switch (role) {
    case "Owner": return "default"
    case "Admin": return "secondary"
    case "Write": return "secondary"
    case "Read": return "outline"
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