import z from "zod"

export const courseSectionUpdateSchema = z.object({
  title: z
    .string()
    .min(3, "Mínimo 3 caracteres"),
})

export type CourseSectionUpdateSchema = z.infer<typeof courseSectionUpdateSchema>