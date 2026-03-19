import { Pencil, MoreVerticalIcon, ArrowRightLeft, TableOfContents } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { DialogDelete } from "@/components/shared/dialogs/dialogDelete"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMoveLectureToSectionMutation } from "@/mutations/dashboard/lectures/useMoveLectureToSectionMutation"
import { toast } from "sonner"
import { useDeleteLectureMutation } from "@/mutations/dashboard/lectures/useDeleteLectureMutation"
import { CreateLectureDialog } from "./createLectureSteps/createLectureDialog"
import type { LectureResponseExtended } from "@/types/dashboard/lectures"
import type { CoursePermissionsRole } from "@/types/common/coursePermissions"
import { DCP } from "@/lib/dashboardCoursePermissions"

interface SectionOption {
  id: number
  title: string
  position: number
}

interface CourseLectureActionsProps {
  lecture: LectureResponseExtended
  currentUserPermission: CoursePermissionsRole
  courseId: number
  currentSectionId: number
  sections: SectionOption[]
}

export function LectureCardActions({ lecture, courseId, currentSectionId, sections, currentUserPermission }: CourseLectureActionsProps) {
  const onDeleteMutation = useDeleteLectureMutation()
  const onMoveToMutation = useMoveLectureToSectionMutation()

  const handleOnDelete = () => {
    onDeleteMutation.mutate({
      lectureId: lecture.id,
      courseId
    }, {
      onSuccess: () => {
        toast.success("La lección ha sido eliminada correctamente")
      }
    })
  }

  const handleOnMoveTo = (newSectionId: number) => {
    onMoveToMutation.mutate({
      newCourseSectionId: newSectionId,
      lectureId: lecture.id,
      courseId
    }, {
      onSuccess: () => {
        toast.success("La lección ha sido movida correctamente")
      }
    })
  }

  const availableSections = sections.filter((s) => s.id !== currentSectionId)
  const disabledEditLecture = !DCP.canModifyLecture(currentUserPermission)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVerticalIcon className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {disabledEditLecture
          ? <div className="flex items-center px-2 py-1 gap-2 hover:bg-accent rounded-sm pointer-events-none opacity-50">
              <Pencil className="h-4 w-4" />
              <span>Editar</span>
            </div>
          : <CreateLectureDialog
              editLectureId={lecture.id}
              courseId={courseId} 
              courseSectionId={currentSectionId} 
              trigger={(setIsOpen) => (
                <div className="flex items-center px-2 py-1 gap-2 hover:bg-accent rounded-sm" onClick={setIsOpen}>
                  <Pencil className="h-4 w-4" />
                  <span>Editar</span>
                </div>
              )}
            />
        }

        {availableSections.length > 0 && !disabledEditLecture && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ArrowRightLeft className="h-4 w-4" />
              <span>Mover a</span>
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent className="p-0">
              <ScrollArea className="max-h-50">
                <div className="p-1">
                  {availableSections.map((section) => (
                    <DropdownMenuItem
                      key={section.id}
                      onClick={() => handleOnMoveTo(section.id)}
                    >
                      <TableOfContents className="h-4 w-4" />
                      <span className="truncate">{section.position} - {section.title}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </ScrollArea>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        <DropdownMenuSeparator />

        <DialogDelete
          entity="lección"
          trigger="both"
          isLoading={onDeleteMutation.isLoading || disabledEditLecture}
          handleDelete={handleOnDelete}
        >
          ¿Estás seguro de que deseas eliminar esta lección?
        </DialogDelete>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
