import { useState } from "react"
import { Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DCP } from "@/lib/dashboardCoursePermissions"
import type { CoursePermissionsRole } from "@/types/common/coursePermissions"
import { FilesDropzoneContent } from "./fillesDropzoneContent"

interface FilesDropzoneDialogProps {
  courseId: number
  currentUserPermission: CoursePermissionsRole
}

export function FilesDropzoneDialog({
  courseId,
  currentUserPermission,
}: FilesDropzoneDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const uploadDisabled = !DCP.canUploadFiles(currentUserPermission)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={uploadDisabled}>
          <Upload className="mr-2 h-4 w-4" />
          Cargar archivos
        </Button>
      </DialogTrigger>

      <DialogContent className="[&>button]:hidden min-w-[60vw]" onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Cargar archivos</DialogTitle>
        </DialogHeader>

        <FilesDropzoneContent
          setIsOpen={setIsOpen}
          courseId={courseId}
          uploadDisabled={uploadDisabled}
          onSuccess={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
