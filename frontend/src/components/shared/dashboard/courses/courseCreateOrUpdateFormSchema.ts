import { formatCourseLectureAccesibility, formatCourseVisibility } from "@/lib/format"
import { COURSE_LANGUAGES, COURSE_LECTURES_ACCESIBILITY, COURSE_VISIBILITY, type CourseLecturesAccesibility, type CourseVisibility } from "@/types/common/courses"
import { MAX_COURSE_TAG_LENGTH, MAX_COURSE_TAGS, MIN_COURSE_TAG_LENGTH } from "@/types/common/tags"
import type { UploadFilesResponse } from "@/types/dashboard/files"
import z from "zod"

// CREATE
export const createCourseFormSchema = z.object({
  title: z
    .string("El título es obligatorio")
    .min(1, "El título es obligatorio")
    .max(100, "Máximo 100 caracteres"),

  description: z
    .string("La descripción es obligatoria")
    .min(1, "La descripción es obligatoria")
    .max(500, "Máximo 500 caracteres"),
    
  visibility: z
    .enum(COURSE_VISIBILITY, "La visibilidad es obligatoria"),

  lectureAccesibility: z
    .enum(COURSE_LECTURES_ACCESIBILITY, "La accesibilidad es obligatoria"),

  language: z
    .enum(COURSE_LANGUAGES, "El idioma es obligatorio"),
    
  price: z
    .number("El precio debe ser un número")
    .min(0, "El precio no puede ser negativo"),

  discountPercent: z
    .number("El descuento debe ser un número" )
    .min(0, "El descuento no puede ser menor a 0")
    .max(100, "El descuento no puede ser mayor a 100")
})

export type CreateCourseFormSchema = z.infer<typeof createCourseFormSchema>

// MODIFY
export const modifyCoursePropsSchema = z.object({
  title: z
    .string()
    .min(1, "El título es requerido")
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(255, "El título no puede exceder 255 caracteres")
    .optional(),

  description: z
    .string()
    .min(1, "La descripción es requerida")
    .optional(),

  posterFile: z
    .custom<UploadFilesResponse | null>()
    .optional(),

  visibility: z
    .enum(COURSE_VISIBILITY, { error: "Selecciona una visibilidad válida" })
    .optional(),

  lectureAccesibility: z
    .enum(COURSE_LECTURES_ACCESIBILITY, { error: "Selecciona una accesibilidad válida" })
    .optional(),

  language: z
    .enum(COURSE_LANGUAGES, { error: "Selecciona un idioma válido" })
    .optional(),

  price: z
    .number("El precio debe ser un número" )
    .min(0, "El precio no puede ser negativo")
    .optional(),

  discountPercent: z
    .number("El descuento debe ser un número")
    .min(0, "El descuento no puede ser menor a 0")
    .max(100, "El descuento no puede ser mayor a 100")
    .optional(),

  tags: z
    .array(
      z.object({
        value: z
          .string()
          .trim()
          .min(MIN_COURSE_TAG_LENGTH, `Cada etiqueta debe tener al menos ${MIN_COURSE_TAG_LENGTH} caracteres`)
          .max(MAX_COURSE_TAG_LENGTH, `Cada etiqueta no puede exceder ${MAX_COURSE_TAG_LENGTH} caracteres`),
        label: z
          .string()
          .trim()
          .min(MIN_COURSE_TAG_LENGTH, `Cada etiqueta debe tener al menos ${MIN_COURSE_TAG_LENGTH} caracteres`)
          .max(MAX_COURSE_TAG_LENGTH, `Cada etiqueta no puede exceder ${MAX_COURSE_TAG_LENGTH} caracteres`),
      })
    )
    .max(MAX_COURSE_TAGS, `Máximo ${MAX_COURSE_TAGS} etiquetas`)
    .optional()
})

export type ModifyCoursePropsSchema = z.infer<typeof modifyCoursePropsSchema>



export const COURSE_VISIBILITY_OPTIONS: { value: CourseVisibility, label: string, description: string }[] = [
  {
    value: "Private",
    label: formatCourseVisibility('Private'),
    description: "Solo tú puedes ver este curso"
  },
  {
    value: "Link",
    label: formatCourseVisibility('Link'),
    description: "Solo personas con el enlace pueden ver este curso"
  },
  {
    value: "Public",
    label: formatCourseVisibility('Public'),
    description: "Cualquiera puede ver este curso"
  }
]

export const COURSE_LECTURES_ACCESIBILITY_OPTIONS: { value: CourseLecturesAccesibility, label: string, description: string }[] = [
  {
    value: "Open",
    label: formatCourseLectureAccesibility("Open"),
    description: "Todas las lecciones están disponibles desde el inicio"
  },
  {
    value: "Section",
    label: formatCourseLectureAccesibility("Section"),
    description: "Completa todas las lecciones de la sección para avanzar"
  },
  {
    value: "QuizOrLab",
    label: formatCourseLectureAccesibility("QuizOrLab"),
    description: "Completa el cuestionario o laboratorio más cercano para avanzar"
  },
  {
    value: "Closed",
    label: formatCourseLectureAccesibility("Closed"),
    description: "Completa la lección anterior para desbloquear la siguiente"
  }
]