import { z } from "zod"
import { LECTURE_VISIBILITY, LECTURE_KIND } from "@/types/common/lectures"
import type { LectureResponse } from "@/types/dashboard/lectures"
import type { SerializedEditorState, SerializedLexicalNode } from "lexical"

// Step 1: Basic lecture information
export const basicLectureFormSchema = z.object({
  title: z
    .string("El título es obligatorio" )
    .min(1, "El título es obligatorio")
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder los 200 caracteres"),
  
  description: z
    .string("La descripción es obligatoria")
    .min(1, "La descripción es obligatoria")
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(1000, "La descripción no puede exceder los 1000 caracteres"),
  
  visibility: z.enum(LECTURE_VISIBILITY,  "La visibilidad es obligatoria"),
  
  lectureKind: z.enum(LECTURE_KIND, "El tipo de lección es obligatorio"),
})

// Step 2: specific data
export const videoLectureDataSchema = z.object({
  fileId: z
    .number("Debes seleccionar un archivo de video")
    .min(1, "Debes seleccionar un archivo de video válido"),
})

export const documentLectureDataSchema = z.object({
  body: z
    .custom<SerializedEditorState<SerializedLexicalNode>>((val) => {
      return val && typeof val === "object"
    },  "El contenido del documento es obligatorio y debe tener al menos 10 caracteres")
})

// Step 2: Quiz lecture specific data (placeholder)
export const quizLectureDataSchema = z.object({
  quizId: z
    .number("Debes seleccionar un cuestionario")
    .min(1, "Debes seleccionar un cuestionario válido"),
})

// Step 2: Lab lecture specific data (placeholder)
export const labLectureDataSchema = z.object({})

export type BasicLectureFormSchema = z.infer<typeof basicLectureFormSchema>
export type VideoLectureDataSchema = z.infer<typeof videoLectureDataSchema>
export type DocumentLectureDataSchema = z.infer<typeof documentLectureDataSchema>
export type QuizLectureDataSchema = z.infer<typeof quizLectureDataSchema>
export type LabLectureDataSchema = z.infer<typeof labLectureDataSchema>
export type SpecificStepSchema = VideoLectureDataSchema | DocumentLectureDataSchema | QuizLectureDataSchema | LabLectureDataSchema

export interface LectureKindToSpecificStepSchema {
  Video: VideoLectureDataSchema
  Document: DocumentLectureDataSchema
  Quiz: QuizLectureDataSchema
  Lab: LabLectureDataSchema
}

export interface SpecificStepLectureComponentProps<T extends SpecificStepSchema> {
  courseId: number
  courseSectionId: number
  lectureId: number | null
  isEditMode: boolean

  onSubmit: (data: LectureResponse) => void
  onForward: () => void
  onBack: () => void
  basicData: BasicLectureFormSchema
  specificData?: T | null
}