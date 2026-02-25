import z from "zod"

export const playQuizQuestionBoolSingleFormSchema = z.object({
  choiceId: z.string().min(1, "Selecciona una opción"),
})
export type PlayQuizQuestionBoolSingleFormSchema = z.infer<typeof playQuizQuestionBoolSingleFormSchema>

export const playQuizQuestionBoolMultipleFormSchema = z.object({
  choicesId: z.array(z.string()).min(1, "Selecciona al menos una opción"),
})
export type PlayQuizQuestionBoolMultipleFormSchema = z.infer<typeof playQuizQuestionBoolMultipleFormSchema>

export const playQuizQuestionTextSingleFormSchema = z.object({
  choice: z.string().min(1, "Escribe tu respuesta"),
})
export type PlayQuizQuestionTextSingleFormSchema = z.infer<typeof playQuizQuestionTextSingleFormSchema>

export const buildPlayQuizQuestionTextMultipleFormSchema = (total: number) =>
  z.object({
    choicesId: z
      .array(z.string().min(1, "Campo requerido"))
      .length(total, `Ingresa exactamente ${total} palabra(s) clave`),
  })
export type PlayQuizQuestionTextMultipleFormSchema = { choicesId: string[] }

export const playQuizQuestionMatchFormSchema = z.object({
  choices: z.array(
    z.object({
      keyId: z.string(),
      valueId: z.string().min(1, "Selecciona una opción"),
    })
  ),
})
export type PlayQuizQuestionMatchFormSchema = z.infer<typeof playQuizQuestionMatchFormSchema>
