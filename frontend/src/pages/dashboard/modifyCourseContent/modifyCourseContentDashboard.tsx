import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useCourseDetailsQuery } from "@/queries/dashboard/courses/useCourseDetailsQuery"
import { useParams } from "react-router-dom"
import { useDashboardCoursePermissionsQuery } from "@/queries/dashboard/coursePermissions/useCoursePermissions"
import { useValidId } from "@/hooks/useValidId"
import { useFilesQuery } from "@/queries/dashboard/files/useFilesQuery"
import { FileList } from "@/components/shared/files/filesList"
import { FilesDropzoneDialog } from "@/components/shared/files/filesDropzoneDialog"
import { WFullSpinner } from "@/components/shared/fullPageSpinner/fullPageSpinner"
import { CourseProps } from "@/components/shared/dashboard/courses/courseProps"
import { CoursePermissionsActionsAddUser } from "@/components/shared/dashboard/coursePermissions/coursePermissionsActionsAddUser"
import { CoursePermissions } from "@/components/shared/dashboard/coursePermissions/coursePermissions"
import { CreateCourseSectionDialog } from "@/components/shared/dashboard/courseSections/createCourseSectionDialog"
import { CourseSections } from "@/components/shared/dashboard/courseSections/courseSections"

export default function ModifyCourseContentDashboard() {
  const { courseId: courseIdStr } = useParams()
  const courseId = useValidId(courseIdStr!, "/dashboard/courses")

  const courseDetails = useCourseDetailsQuery({ courseId: courseId! })
  const membersPermissions = useDashboardCoursePermissionsQuery({ courseId: courseId! })
  const files = useFilesQuery({ courseId: courseId! })

  if (!courseId) {
    return <Spinner />
  }

  return (
    <div>
      <section className="flex flex-1 flex-col gap-4 p-4 max-w-350 m-auto">
        {courseDetails.data 
          ? <CourseProps course={courseDetails.data}/>
          : <WFullSpinner className="w-8 h-8"/>
        }
      </section>

      <div className="py-4">
        <Separator />
      </div>

      <section className="flex flex-1 flex-col gap-4 p-4 max-w-350 m-auto">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestionar permisos</h1>
            <p className="text-sm text-muted-foreground">
              Controla quién tiene acceso a la gestión de tu curso y qué permisos tienen.
            </p>
          </div>

          {membersPermissions.data
            ? <CoursePermissionsActionsAddUser courseId={courseId} members={membersPermissions.data} />
            : <Spinner />
          }    
        </header>

        {membersPermissions.data
          ? <CoursePermissions courseId={courseId} members={membersPermissions.data} />
          : <WFullSpinner className="w-8 h-8"/>
        }
      </section>

      <div className="py-4">
        <Separator />
      </div>

      <section className="flex flex-1 flex-col gap-4 p-4 max-w-350 m-auto">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contenido</h1>
            <p className="text-sm text-muted-foreground">
              Organiza y gestiona las secciones y lecciones del curso
            </p>
          </div>

          {courseDetails.data 
            ? <CreateCourseSectionDialog courseId={courseId!} />
            : <Spinner />
          }
        </header>

        {courseDetails.data 
          ? <CourseSections course={courseDetails.data}/>
          : <WFullSpinner className="w-8 h-8"/>
        }
      </section>

      <div className="py-4">
        <Separator />
      </div>

      <section className="flex flex-1 flex-col gap-4 p-4 max-w-350 m-auto">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestionar archivos</h1>
            <p className="text-sm text-muted-foreground">
              Sube y gestiona los archivos de tu curso.
            </p>
          </div>

          {files.data
            ? <FilesDropzoneDialog courseId={courseId!} />
            : <Spinner />
          }    
        </header>

        {files.data
          ? <FileList 
              files={files.data.pages.flat()} 
              onLoadMore={files.fetchNextPage}
              isFetchingNextPage={files.isFetchingNextPage}
              hasNextPage={files.hasNextPage ?? false}
            />
          : <WFullSpinner className="h-8 w-8"/>
        }
      </section>
    </div>

  )
}