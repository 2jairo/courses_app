import { z } from "zod"

export const lectureCommentFormSchema = z.object({
  body: z.string()
    .min(1, "El comentario no puede estar vacío")
    .max(1000, "El comentario es demasiado largo"),
})

export type LectureCommentFormSchema = z.infer<typeof lectureCommentFormSchema>
