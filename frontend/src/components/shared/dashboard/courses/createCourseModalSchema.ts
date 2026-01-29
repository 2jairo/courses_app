import { COURSE_LANGUAGES, COURSE_VISIBILITY } from "@/types/common/courses"
import { z } from "zod"

export const createCourseModalSchema = z.object({
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
  language: z
    .enum(COURSE_LANGUAGES, "El idioma es obligatorio")
})

export type CreateCourseModalSchema = z.infer<typeof createCourseModalSchema>