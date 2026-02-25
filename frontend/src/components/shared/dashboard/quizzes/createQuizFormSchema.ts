import { z } from "zod"

export const createQuizFormSchema = z.object({
  title: z
    .string("El título debe ser texto")
    .min(3, "El título debe tener mínimo 3 caracteres")
    .max(100, "El título debe tener máximo 100 caracteres"),
  timeLimitMinutes: z
    .number("El tiempo debe ser un número")
    .min(0, "El tiempo no puede ser negativo")
    .max(600, "El tiempo máximo es 600 minutos"),
  passingScorePercentage: z
    .number("El porcentaje debe ser un número")
    .min(1, "El porcentaje mínimo es 1%")
    .max(100, "El porcentaje máximo es 100%"),
  shuffleQuestions: z.boolean(),
  showCorrectAnswers: z.boolean(),
})

export type CreateQuizFormSchema = z.infer<typeof createQuizFormSchema>

