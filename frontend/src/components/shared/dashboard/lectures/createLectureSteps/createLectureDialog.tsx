import React, { useState, useEffect } from "react"
import { ArrowRight } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useLectureQuery } from "@/queries/dashboard/lectures/useLectureQuery"
import { useLectureFilesQuery } from "@/queries/dashboard/lectures/useLectureFilesQuery"
import type { LectureKind } from "@/types/common/lectures"

import { BasicLectureForm } from "./basicLectureForm"
import { VideoLectureForm } from "./videoLectureForm"
import { DocumentLectureForm } from "./documentLectureForm"
import { QuizLectureForm } from "./quizLectureForm"
import { LabLectureForm } from "./labLectureForm"
import { AssetsSelectionForm } from "./assetsSelectionForm"

import type {  BasicLectureFormSchema, LectureKindToSpecificStepSchema, SpecificStepLectureComponentProps, SpecificStepSchema } from "./createLectureFormSchemas"
import { formatLectureKind } from "@/lib/format"
import { toast } from "sonner"
import { LectureKindBadge } from "@/components/shared/lecturesUtils/lectureKindIcon"
import type { CoursePermissionsRole } from "@/types/common/coursePermissions"

interface CreateLectureDialogProps {
  courseSectionId: number
  courseId: number
  editLectureId?: number
  currentUserPermission: CoursePermissionsRole
  trigger: (setIsOpen: () => void) => React.ReactNode
}

type Step = 'basic' | 'specific' | 'assets'

export function CreateLectureDialog({ courseSectionId, courseId, editLectureId, currentUserPermission, trigger }: CreateLectureDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>('basic')
  const [basicData, setBasicData] = useState<BasicLectureFormSchema | null>(null)
  const [specificData, setSpecificData] = useState<Partial<LectureKindToSpecificStepSchema>>({})
  const [createdLectureId, setCreatedLectureId] = useState<number | null>(null)
  
  const isEditMode = editLectureId !== undefined
  const lectureId = editLectureId || createdLectureId
  
  
  // Query for existing lecture data when editing
  const existentLecture = useLectureQuery({ lectureId: editLectureId! })
  const existentLectureFiles = useLectureFilesQuery({ lectureId: editLectureId! })

  useEffect(() => {
    if (isEditMode && existentLecture.data && !basicData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBasicData({
        title: existentLecture.data.title,
        description: existentLecture.data.description,
        visibility: existentLecture.data.visibility,
        lectureKind: existentLecture.data.kind,
      })

      setSpecificData((prev) => {
        switch (existentLecture.data.kind) {
          case 'Video':
            return {
              ...prev,
              Video: { fileId: existentLecture.data.data.fileId }
            }
          case 'Document':
            return {
              ...prev,
              Document: { body: existentLecture.data.data.body }
            }
          case 'Lab':
            return {
              ...prev,
              Lab: {}
            }
          case 'Quiz':
            return {
              ...prev,
              Quiz: { quizId: existentLecture.data.data.id }
            }
        }
      })
    }
  }, [isEditMode, existentLecture, basicData])

  const handleClose = () => {
    setIsOpen(false)
    setCurrentStep('basic')
    setBasicData(null)
    setSpecificData({})
    setCreatedLectureId(null)
  }

  const handleBasicStepComplete = (data: BasicLectureFormSchema) => {
    setBasicData(data)
    setCurrentStep('specific')
  }

  const handleSpecificStepComplete = <K extends LectureKind,>(kind: K, data: SpecificStepSchema, lectureId: number) => {
    toast.success(isEditMode 
      ? 'Lección actualizada correctamente'
      : 'Lección creada correctamente'
    )
    
    setSpecificData((prev) => {
      return {
        ...prev,
        [kind]: data
      }
    })
    setCreatedLectureId(lectureId)
    setCurrentStep('assets')
  }

  const handleAssetsSelection = () => {
    toast.success(isEditMode 
      ? 'Archivos suplementarios actualizados correctamente' 
      : 'Archivos suplementarios añadidos correctamente'
    )
    handleClose()
  }

  const getCommonProps = <K extends LectureKind, S extends LectureKindToSpecificStepSchema[K]>(
    kind: K,
  ): SpecificStepLectureComponentProps<S> => ({
    courseId,
    courseSectionId,
    lectureId,
    onBack: () => setCurrentStep('basic'),
    onForward: () => setCurrentStep('assets'),
    onSubmit: (l) => handleSpecificStepComplete(kind, l.data as SpecificStepSchema, l.id),
    basicData: basicData!,
    specificData: specificData[kind] as S | null | undefined,
    isEditMode,
    currentUserPermission
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild >
        {trigger(() => setIsOpen(true))}
      </DialogTrigger>

      <DialogContent 
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={`flex flex-col ${currentStep === 'specific' || currentStep === 'assets' ? 'min-w-screen h-screen rounded-none' : ''}`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? 'Editar lección' : 'Crear nueva lección'}
            {basicData && (
              <LectureKindBadge lectureKind={basicData.lectureKind} />
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="max-w-350 w-full mx-auto min-h-0 flex flex-col flex-1 max-h-screen overflow-auto">
          <div className="flex items-center flex-wrap gap-2 mb-6">
            <Badge variant={currentStep === 'basic' ? 'default' : 'secondary'} className="text-xs">
              1. Información básica
            </Badge>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <Badge variant={currentStep === 'specific' ? 'default' : 'secondary'} className="text-xs">
              2. {basicData ? `Configurar ${formatLectureKind(basicData.lectureKind)}` : 'Configuración específica'}
            </Badge>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <Badge variant={currentStep === 'assets' ? 'default' : 'secondary'} className="text-xs">
              3. Archivos complementarios (opcional)
            </Badge>
          </div>

          {currentStep === 'basic' && (
            <BasicLectureForm
              initialData={basicData}
              onSubmit={handleBasicStepComplete}
              isSubmitting={false}
            />
          )}

          {currentStep === 'specific' && basicData && (
            <>
              {basicData.lectureKind === 'Video' && <VideoLectureForm {...getCommonProps('Video')} />}
              {basicData.lectureKind === 'Document' && <DocumentLectureForm {...getCommonProps('Document')} />}
              {basicData.lectureKind === 'Quiz' && <QuizLectureForm {...getCommonProps('Quiz')} />}
              {basicData.lectureKind === 'Lab' && <LabLectureForm {...getCommonProps('Lab')} />}
            </>
          )}
          
          {currentStep === 'assets' && (!isEditMode || existentLectureFiles.data) && lectureId && (
            <AssetsSelectionForm
              onSubmit={handleAssetsSelection}
              onBack={() => setCurrentStep('specific')}
              courseId={courseId}
              lectureId={lectureId}
              initialSelectedFiles={existentLectureFiles.data?.map(l => l.file)}
              currentUserPermission={currentUserPermission}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
