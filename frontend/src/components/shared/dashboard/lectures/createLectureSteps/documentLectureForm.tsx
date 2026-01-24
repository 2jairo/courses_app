import React, { useState, Suspense, useCallback } from "react"
import { ArrowLeft } from "lucide-react"
import type { SerializedEditorState } from "lexical"
import { Button } from "@/components/ui/button"
import { useCreateLectureMutation } from "@/mutations/dashboard/lectures/useCreateLectureMutation"
import type { SpecificStepLectureComponentProps, SpecificStepSchema, DocumentLectureDataSchema } from "./createLectureFormSchemas"

const Editor = React.lazy(() => import('@/components/blocks/editor-00/editor')) 


const initialEditorState: SerializedEditorState = {
  root: {
    children: [
      {
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
}

export function DocumentLectureForm({ courseId, onSubmit, onBack, onForward, basicData, courseSectionId, specificData }: SpecificStepLectureComponentProps<DocumentLectureDataSchema>) {
  const createLectureMutation = useCreateLectureMutation()
  
  const [editorState, setEditorState] = useState<SerializedEditorState>(() => {
    try {
      if(specificData) return JSON.parse(specificData.body)
    } catch {
      return initialEditorState
    }
    return initialEditorState
  })
  const isSubmitting = createLectureMutation.isLoading

  const handleEditorChange = useCallback((newEditorState: SerializedEditorState) => {
    setEditorState(newEditorState)
  }, [])

  const handleOnSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    createLectureMutation.mutate({
      courseId,
      payload: {
        ...basicData,
        lectureKind: 'Document',
        lectureData: { body: JSON.stringify(editorState) },
        courseSectionId
      }
    }, {
      onSuccess: (lecture) => onSubmit(lecture.data as SpecificStepSchema)
    })
  }

  return (
    <form onSubmit={handleOnSubmit} className="space-y-6 flex flex-col flex-1 min-h-0">
      <Suspense fallback={
        <div className="flex items-center justify-center border rounded-lg bg-muted/50 h-64">
          <div className="text-muted-foreground">Cargando editor...</div>
        </div>
      }>
        <Editor
          className="flex-1 min-h-0"
          maxLength={5000}
          editorSerializedState={editorState}
          onSerializedChange={handleEditorChange}
        />
      </Suspense>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2">💡 Consejos para crear contenido efectivo:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Usa los controles de formato para estructurar tu contenido</li>
          <li>• Añade títulos y subtítulos para organizar las secciones</li>
          <li>• Incluye listas, enlaces y formato de texto para mejorar la legibilidad</li>
          <li>• Añade imágenes y otros elementos multimedia cuando sea relevante</li>
        </ul>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atrás
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear lección"}
        </Button>
      </div>
    </form>
  )
}