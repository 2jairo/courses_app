import { z } from "zod"
import { COURSE_VISIBILITY } from "@/types/courses"

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

  poster: z
    .url("Debe ser una URL válida")
    .optional()
    .or(z.literal("")),

  visibility: z
    .enum(COURSE_VISIBILITY, { error: "Selecciona una visibilidad válida" })
    .optional()
})

export type ModifyCoursePropsSchema = z.infer<typeof modifyCoursePropsSchema>
