import React, { useState, useEffect } from "react"
import { ArrowRight, Video, FileText, Brain, Code2 } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useSetFilesToLectureMutation } from "@/mutations/dashboard/lectures/useSetFilesToLectureMutation"
import { useLectureQuery } from "@/queries/dashboard/lectures/useLectureQuery"
import { useLectureFilesQuery } from "@/queries/dashboard/lectures/useLectureFilesQuery"
import type { LectureKind } from "@/types/lectures"

import { BasicLectureForm } from "./basicLectureForm"
import { VideoLectureForm } from "./videoLectureForm"
import { DocumentLectureForm } from "./documentLectureForm"
import { QuizLectureForm } from "./quizLectureForm"
import { LabLectureForm } from "./labLectureForm"
import { AssetsSelectionForm } from "./assetsSelectionForm"

import type {  BasicLectureFormSchema, LectureKindToSpecificStepSchema, SpecificStepLectureComponentProps, SpecificStepSchema } from "./createLectureFormSchemas"
import { formatLectureKind } from "@/lib/format"
import { toast } from "sonner"

interface CreateLectureDialogProps {
  courseSectionId: number
  courseId: number
  editLectureId?: number
  trigger: (setIsOpen: () => void) => React.ReactNode
}

type Step = 'basic' | 'specific' | 'assets'

export function CreateLectureDialog({ courseSectionId, courseId, editLectureId, trigger }: CreateLectureDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>('basic')
  const [basicData, setBasicData] = useState<BasicLectureFormSchema | null>(null)
  const [specificData, setSpecificData] = useState<Partial<LectureKindToSpecificStepSchema>>({})
  const [createdLectureId, setCreatedLectureId] = useState<number | null>(null)
  
  const isEditMode = editLectureId !== undefined
  const lectureId = editLectureId || createdLectureId
  
  const addFilesToLectureMutation = useSetFilesToLectureMutation()
  
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
            prev.Video = { fileId: existentLecture.data.dataId }
            break;
  
          case 'Document':
            prev.Document = { body: existentLecture.data.data.body }
            break
          
          case 'Lab':
            prev.Lab = {}
            break
          
          case 'Quiz':
            prev.Quiz = {}
            break
        }

        return prev
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

  const handleSpecificStepComplete = <K extends LectureKind,>(kind: K, data: SpecificStepSchema) => {
    toast.success('Lección creada correctamente')
    setSpecificData((prev) => {
      prev[kind] = data as LectureKindToSpecificStepSchema[K]
      return prev
    })
    setCurrentStep('assets')
  }

  const handleAssetsSelection = (selectedFileIds: number[]) => {
    if (selectedFileIds.length > 0 && lectureId) {
      addFilesToLectureMutation.mutate({
        lectureId: lectureId,
        fileIds: selectedFileIds
      })
    }
    toast.success(isEditMode ? 'Lección actualizada correctamente' : 'Lección creada correctamente')
    handleClose()
  }

  const renderCurrentStep = () => {
    if (currentStep === 'basic') {
      return (
        <BasicLectureForm
          initialData={basicData}
          onSubmit={handleBasicStepComplete}
          isSubmitting={false}
        />
      )
    }

    if(currentStep === 'specific' && basicData) {
      const getCommonProps = <K extends LectureKind, S extends LectureKindToSpecificStepSchema[K]>(
        kind: K
      ): SpecificStepLectureComponentProps<S> => {
        return {
          courseId: courseId,
          courseSectionId: courseSectionId,
          onBack: () => setCurrentStep('basic'),
          onForward: () => setCurrentStep('assets'),
          onSubmit: (data) => handleSpecificStepComplete(kind, data),
          basicData: basicData,
          specificData: specificData[kind] as S | null | undefined
        }
      }

      switch (basicData.lectureKind) {
        case 'Video':
          return <VideoLectureForm {...getCommonProps('Video')} />
        case 'Document':
          return <DocumentLectureForm {...getCommonProps('Document')} />
        case 'Quiz':
          return <QuizLectureForm {...getCommonProps('Quiz')}/>
        case 'Lab':
          return <LabLectureForm {...getCommonProps('Lab')} />
      }
    }

    if (currentStep === 'assets') {
      
      return (
        <AssetsSelectionForm
          onSubmit={handleAssetsSelection}
          onBack={() => setCurrentStep('specific')}
          isSubmitting={addFilesToLectureMutation.isLoading}
          courseId={courseId}
          initialSelectedFiles={existentLectureFiles.data?.map(l => l.file)}
        />
      )
    }

    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger(() => setIsOpen(true))}
      </DialogTrigger>

      <DialogContent className={`flex flex-col ${currentStep === 'specific' || currentStep === 'assets' ? 'min-w-screen h-screen rounded-none' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? 'Editar lección' : 'Crear nueva lección'}
            {basicData && (
              <>
                <LectureKindIcon kind={basicData.lectureKind} />
                <span className="text-sm font-normal text-muted-foreground">
                  {formatLectureKind(basicData.lectureKind)}
                </span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="max-w-350 w-full mx-auto min-h-0 flex flex-col flex-1">
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
          
          {renderCurrentStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const LectureKindIcon = ({ kind }: { kind: LectureKind }) => {
  switch (kind) {
    case 'Video': return <Video className="w-4 h-4" />
    case 'Document': return <FileText className="w-4 h-4" />
    case 'Quiz': return <Brain className="w-4 h-4" />
    case 'Lab': return <Code2 className="w-4 h-4" />
  }
}