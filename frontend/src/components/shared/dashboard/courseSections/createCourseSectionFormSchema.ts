import { z } from "zod"

export const createCourseSectionFormSchema = z.object({
  title: z
    .string("El título es obligatorio")
    .min(1, "El título es obligatorio")
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(100, "El título no puede exceder los 100 caracteres"),
})

export type CreateCourseSectionFormSchema = z.infer<typeof createCourseSectionFormSchema>