import { formatQuizQuestionKind, formatQuizQuestionStatus } from "@/lib/format"
import { QUIZ_QUESTION_KIND, QUIZ_QUESTION_STATUS, type QuizQuestionKind } from "@/types/common/quizzesQuestions"
import type { ExtendedQuizResponseQuestion } from "@/types/dashboard/quizzes"
import { z } from "zod"

// Bool choices schema (shared between BoolSingle and BoolMultiple)
const quizQuestionChoiceSchema = z.object({
  text: z
    .string("El texto de la opción es obligatorio")
    .trim()
    .min(1, "El texto de la opción no puede estar vacío")
    .max(500, "El texto de la opción no puede exceder los 500 caracteres"),
  correct: z.boolean(),
})

// BoolMultiple form schema
const quizQuestionBoolMultipleFormSchema = z.object({
  choices: z
    .array(quizQuestionChoiceSchema)
    .min(2, "Debes añadir al menos 2 opciones")
    .max(50, "No puedes añadir más de 50 opciones")
    .refine(
      (choices) => choices.some((c) => c.correct),
      "Debes marcar al menos una opción como correcta"
    )
    .refine(
      (choices) => new Set(choices.map((c) => c.text)).size === choices.length,
      "Las opciones deben ser únicas"
    ),
})

// BoolSingle form schema
const quizQuestionBoolSingleFormSchema = z.object({
  choices: z
    .array(quizQuestionChoiceSchema)
    .min(2, "Debes añadir al menos 2 opciones")
    .max(50, "No puedes añadir más de 50 opciones")
    .refine(
      (choices) => choices.filter((c) => c.correct).length === 1,
      "Debes marcar exactamente una opción como correcta"
    )
    .refine(
      (choices) => new Set(choices.map((c) => c.text)).size === choices.length,
      "Las opciones deben ser únicas"
    ),
})

// TextMultiple form schema
const quizQuestionTextMultipleFormSchema = z.object({
  keywords: z
    .array(
      z.object({
        value: z
          .string("Cada palabra clave debe ser texto")
          .trim()
          .min(1, "Las palabras clave no pueden estar vacías")
          .max(200, "Cada palabra clave no puede exceder los 200 caracteres"),
      })
    )
    .min(1, "Debes añadir al menos 1 palabra clave")
    .max(50, "No puedes añadir más de 50 palabras clave")
    .refine(
      (keywords) => {
        const filled = keywords.map((k) => k.value).filter((v) => v.length > 0)
        return new Set(filled).size === filled.length
      },
      { message: "Las palabras clave deben ser únicas", path: ["root"] }
    ),
})

// TextSingle form schema
const quizQuestionTextSingleFormSchema = z.object({
  correctAnswer: z
    .string("La respuesta correcta es obligatoria")
    .trim()
    .min(1, "La respuesta correcta no puede estar vacía")
    .max(1000, "La respuesta correcta no puede exceder los 1000 caracteres"),
})

// Match form schema
const quizQuestionMatchFormSchema = z.object({
  pairs: z
    .array(
      z.object({
        key: z
          .string("El elemento izquierdo es obligatorio")
          .trim()
          .min(1, "El elemento izquierdo no puede estar vacío")
          .max(500, "El elemento izquierdo no puede exceder los 500 caracteres"),
        value: z
          .string("El elemento derecho es obligatorio")
          .trim()
          .min(1, "El elemento derecho no puede estar vacío")
          .max(500, "El elemento derecho no puede exceder los 500 caracteres"),
      })
    )
    .min(2, "Debes añadir al menos 2 pares")
    .max(50, "No puedes añadir más de 50 pares")
    .refine(
      (pairs) => new Set(pairs.map((p) => p.key)).size === pairs.length,
      "Los elementos izquierdos deben ser únicos"
    )
    .refine(
      (pairs) => new Set(pairs.map((p) => p.value)).size === pairs.length,
      "Los elementos derechos deben ser únicos"
    ),
})

// Ordering form schema
const quizQuestionOrderingFormSchema = z.object({
  items: z
    .array(
      z.object({
        value: z
          .string("Cada elemento debe ser texto")
          .trim()
          .min(1, "Los elementos no pueden estar vacíos")
          .max(500, "Cada elemento no puede exceder los 500 caracteres"),
      })
    )
    .min(2, "Debes añadir al menos 2 elementos")
    .max(50, "No puedes añadir más de 50 elementos")
    .refine(
      (items) => {
        const filled = items.map((i) => i.value).filter((v) => v.length > 0)
        return new Set(filled).size === filled.length
      },
      { message: "Los elementos deben ser únicos", path: ["root"] }
    ),
})

// Base form schema for all questions
const quizQuestionBaseFormSchema = z.object({
  questionText: z
    .string("El texto de la pregunta es obligatorio")
    .min(1, "El texto de la pregunta es obligatorio")
    .min(10, "El texto de la pregunta debe tener al menos 10 caracteres")
    .max(2000, "El texto de la pregunta no puede exceder los 2000 caracteres"),
  
  explanation: z
    .string("La explicación debe ser texto")
    .max(5000, "La explicación no puede exceder los 5000 caracteres")
    .optional()
    .nullable(),
  
  status: z.enum(QUIZ_QUESTION_STATUS, "El estado es obligatorio"),
  
  points: z
    .number("Los puntos deben ser un número")
    .min(1, "Los puntos deben ser al menos 1")
    .max(1000, "Los puntos no pueden exceder 1000"),
  
  kind: z.enum(
    QUIZ_QUESTION_KIND,
    "El tipo de pregunta es obligatorio"
  ),
})

export type QuizQuestionBaseFormSchema = z.infer<typeof quizQuestionBaseFormSchema>

// Discriminated union form schemas
export const createQuizQuestionFormSchemaWithOptions = z.discriminatedUnion("kind", [
  quizQuestionBaseFormSchema.extend({ kind: z.literal("BoolMultiple"), options: quizQuestionBoolMultipleFormSchema }),
  quizQuestionBaseFormSchema.extend({ kind: z.literal("BoolSingle"), options: quizQuestionBoolSingleFormSchema }),
  quizQuestionBaseFormSchema.extend({ kind: z.literal("TextMultiple"), options: quizQuestionTextMultipleFormSchema }),
  quizQuestionBaseFormSchema.extend({ kind: z.literal("TextSingle"), options: quizQuestionTextSingleFormSchema }),
  quizQuestionBaseFormSchema.extend({ kind: z.literal("Match"), options: quizQuestionMatchFormSchema }),
  quizQuestionBaseFormSchema.extend({ kind: z.literal("Ordering"), options: quizQuestionOrderingFormSchema }),
])

export type CreateQuizQuestionWithOptionsFormSchema = z.infer<typeof createQuizQuestionFormSchemaWithOptions>

// Variant types for form components (full parent schema narrowed by kind)
export type QuizQuestionBoolMultipleFormSchema = Extract<CreateQuizQuestionWithOptionsFormSchema, { kind: "BoolMultiple" }>
export type QuizQuestionBoolSingleFormSchema = Extract<CreateQuizQuestionWithOptionsFormSchema, { kind: "BoolSingle" }>
export type QuizQuestionTextMultipleFormSchema = Extract<CreateQuizQuestionWithOptionsFormSchema, { kind: "TextMultiple" }>
export type QuizQuestionTextSingleFormSchema = Extract<CreateQuizQuestionWithOptionsFormSchema, { kind: "TextSingle" }>
export type QuizQuestionMatchFormSchema = Extract<CreateQuizQuestionWithOptionsFormSchema, { kind: "Match" }>
export type QuizQuestionOrderingFormSchema = Extract<CreateQuizQuestionWithOptionsFormSchema, { kind: "Ordering" }>



export const quizQuestionKindOptions: { value: QuizQuestionKind; label: string; desc: string }[] = [
  { 
    value: "BoolSingle",
    label: formatQuizQuestionKind("BoolSingle"), 
    desc: "El estudiante selecciona una única respuesta" 
  },
  { 
    value: "BoolMultiple",
    label: formatQuizQuestionKind("BoolMultiple"), 
    desc: "El estudiante selecciona una o múltiples respuestas" 
  },
  { 
    value: "Ordering",
    label: formatQuizQuestionKind("Ordering"), 
    desc: "El estudiante ordena elementos en la secuencia correcta" 
  },
  { 
    value: "TextSingle",
    label: formatQuizQuestionKind("TextSingle"), 
    desc: "El estudiante escribe exactamente la respuesta correcta" 
  },
  { 
    value: "TextMultiple",
    label: formatQuizQuestionKind("TextMultiple"), 
    desc: "El estudiante escribe multiples palabras o frases" 
  },
  { 
    value: "Match",
    label: formatQuizQuestionKind("Match"), 
    desc: "El estudiante empareja elementos de dos columnas" 
  },
]

export const quizQuestionStatusOptions = [
  { value: "Public" as const, label: formatQuizQuestionStatus("Public") },
  { value: "Private" as const, label: formatQuizQuestionStatus("Private") },
]

export function getDefaultQuizQuestionFormValues(kind: QuizQuestionKind, initialData?: ExtendedQuizResponseQuestion) {
  const base = {
    questionText: initialData?.questionText || "",
    explanation: initialData?.explanation || "",
    status: initialData?.status || "Public",
    points: initialData?.points || 10
  }

  switch (kind) {
    case "BoolMultiple":
      return { 
        ...base, 
        kind: "BoolMultiple", 
        options: initialData?.kind === "BoolMultiple" 
          ? initialData.options!
          : { 
            choices: [
              { text: "", correct: false }, 
              { text: "", correct: false }
            ] 
          }
      } as QuizQuestionBoolMultipleFormSchema
    case "BoolSingle":
      return {
        ...base,
        kind: "BoolSingle",
        options: initialData?.kind === "BoolSingle"
          ? initialData.options!
          : {
            choices: [
              { text: "", correct: false },
              { text: "", correct: false }
            ]
          }
      } as QuizQuestionBoolSingleFormSchema
    case "TextMultiple":
      return {
        ...base,
        kind: "TextMultiple",
        options: initialData?.kind === "TextMultiple"
          ? initialData.options!
          : { 
            keywords: [{ value: "" }]
          }
      } as QuizQuestionTextMultipleFormSchema
    case "TextSingle":
      return {
        ...base,
        kind: "TextSingle",
        options: initialData?.kind === "TextSingle"
          ? initialData.options!
          : { correctAnswer: "" }
      } as QuizQuestionTextSingleFormSchema
    case "Match":
      return {
        ...base,
        kind: "Match",
        options: initialData?.kind === "Match"
          ? initialData.options!
          : {
            pairs: [
              { key: "", value: "" },
              { key: "", value: "" }
            ]
          }
      } as QuizQuestionMatchFormSchema
    case "Ordering": 
      return {
        ...base,
        kind: "Ordering",
        options: initialData?.kind === "Ordering"
          ? initialData.options!
          : { 
            items: [
              { value: "" }, 
              { value: "" }
            ] 
          }
      } as QuizQuestionOrderingFormSchema
  }
}