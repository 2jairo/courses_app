import { z } from "zod"
import { LECTURE_VISIBILITY, LECTURE_KIND } from "@/types/lectures"

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

// Step 2: Video lecture specific data
export const videoLectureDataSchema = z.object({
  fileId: z
    .number("Debes seleccionar un archivo de video")
    .min(1, "Debes seleccionar un archivo de video válido"),
})

// Step 2: Document lecture specific data
export const documentLectureDataSchema = z.object({
  body: z
    .string("El contenido del documento es obligatorio")
    .min(1, "El contenido del documento es obligatorio")
    .min(10, "El contenido debe tener al menos 10 caracteres"),
})

// Step 2: Quiz lecture specific data (placeholder)
export const quizLectureDataSchema = z.object({})

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

  onSubmit: (data: SpecificStepSchema) => void
  onForward: () => void
  onBack: () => void
  basicData: BasicLectureFormSchema
  specificData?: T | null
}