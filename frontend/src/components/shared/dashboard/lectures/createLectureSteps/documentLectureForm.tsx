import React, { Suspense } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCreateLectureMutation } from "@/mutations/dashboard/lectures/useCreateLectureMutation"
import type { SpecificStepLectureComponentProps, DocumentLectureDataSchema } from "./createLectureFormSchemas"
import { useUpdateLectureMutation } from "@/mutations/dashboard/lectures/useUpdateLectureMutation"
import { useLexicalEditor } from "@/hooks/useLexicalEditor"

const Editor = React.lazy(() => import('@/components/blocks/editor-00/editor'))

export function DocumentLectureForm({ 
  courseId, 
  courseSectionId, 
  lectureId,
  onSubmit, 
  onBack, 
  onForward, 
  basicData, 
  specificData,
  isEditMode,
}: SpecificStepLectureComponentProps<DocumentLectureDataSchema>) {
  const createLectureMutation = useCreateLectureMutation()
  const updateLectureMutation = useUpdateLectureMutation()

  const [editorState, setEditorState] = useLexicalEditor(specificData?.body)
  const isSubmitting = createLectureMutation.isLoading

  const handleOnSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if(isEditMode) {
      updateLectureMutation.mutate({
        courseId,
        payload: {
          ...basicData,
          lectureKind: 'Document',
          lectureData: { body: editorState },
          lectureId: lectureId!
        }
      }, {
        onSuccess: (lecture) => onSubmit(lecture)
      })
    } else {
      createLectureMutation.mutate({
        courseId,
        payload: {
          ...basicData,
          lectureKind: 'Document',
          lectureData: { body: editorState },
          courseSectionId
        }
      }, {
        onSuccess: (lecture) => onSubmit(lecture)
      })
    }

  }

  return (
    <form onSubmit={handleOnSubmit} className="space-y-6 flex flex-col flex-1 min-h-0">
      <Suspense fallback={
        <div className="flex items-center justify-center border rounded-lg bg-muted/50 flex-1 min-h-0">
          <div className="text-muted-foreground">Cargando editor...</div>
        </div>
      }>
        <Editor
          className="flex-1 min-h-0"
          maxLength={20000}
          editorSerializedState={editorState}
          onSerializedChange={setEditorState}
        />
      </Suspense>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2">💡 Consejos para crear contenido efectivo:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Usa los controles de formato para estructurar tu contenido</li>
          <li>• Añade títulos y subtítulos para organizar las secciones</li>
          <li>• Incluye listas, enlaces y formato de texto para mejorar la legibilidad</li>
          <li>• Añade imágenes y otros elementos multimedia cuando sea relevante</li>
          <li>• El índice se forma automáticamente con los títulos (headings) que agregues</li>
        </ul>
      </div>


      <div className="mt-4 pt-4 border-t flex justify-between shrink-0">
        <div className="flex gap-4 items-center">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Atrás
          </Button>

          {isEditMode && (
            <Button type="button" variant="outline" onClick={onForward} disabled={isSubmitting}>
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isEditMode
            ? isSubmitting ? "Actualizando..." : "Actualizar"
            : isSubmitting ? "Creando..." : "Crear lección"
          }
        </Button>
      </div>
    </form>
  )
}