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
import { CreateCourseSectionDialog } from "@/components/shared/dashboard/courseSections/createCourseSectionDialog"
import { CourseSections } from "@/components/shared/dashboard/courseSections/courseSections"
import { FileListFilters } from "@/components/shared/files/filesListFilters"
import { useState, useEffect } from "react"
import type { GetFilesRequest } from "@/types/dashboard/files"
import { CoursePermissions } from "@/components/shared/dashboard/coursePermissions/coursePermissions"
import { CreateQuizDialog } from "@/components/shared/dashboard/quizzes/createQuizDialog"
import { QuizList } from "@/components/shared/dashboard/quizzes/quizList"
import { useQuizzesQuery } from "@/queries/dashboard/quizzes/useQuizzesQuery"
import type { GetQuizzesRequest } from "@/types/dashboard/quizzes"
import { QuizzesListFilters } from "@/components/shared/dashboard/quizzes/quizzesListFilters"
import { CoursePropsActions } from "@/components/shared/dashboard/courses/coursePropsActions"
import { setDocumentTitle } from "@/lib/documentTitle"

export default function DashboardModifyCoursePage() {
  const { courseId: courseIdStr } = useParams()
  const courseId = useValidId(courseIdStr!, "/dashboard/courses")

  const courseDetails = useCourseDetailsQuery({ courseId: courseId! })
  const membersPermissions = useDashboardCoursePermissionsQuery({ courseId: courseId! })

  useEffect(() => {
    document.title = "Editar curso | Impulso"
    setDocumentTitle(`Editar curso: ${courseDetails.data?.title || ''}`)
  }, [courseDetails])

  const [quizzesQueryFilters, setQuizzesQueryFilters] = useState<Omit<GetQuizzesRequest, 'courseId'>>({
    sortBy: "date",
    sortOrder: "desc",
    q: null,
  })
  const quizzesQuery = useQuizzesQuery({ courseId: courseId!, ...quizzesQueryFilters })

  const [filesQueryFilters, setFilesQueryFilters] = useState<Omit<GetFilesRequest, 'courseId'>>({ 
    sortBy: "date",
    sortOrder: "desc",
    kind: [],
    q: null,
    status: [],
    user: []
  })
  const filesQuery = useFilesQuery({ courseId: courseId!, ...filesQueryFilters })

  if (!courseId) {
    return <Spinner />
  }

  return (
    <div>
      <div className="flex flex-1 flex-col gap-4 p-4 max-w-350 m-auto">
        {courseDetails.data && (
          <div className="flex justify-between">
            <h1>Acciones</h1>
            <CoursePropsActions course={courseDetails.data} disabledActions={['edit']} />
          </div>
        )}
      </div>

      <Separator />

      <section className="flex flex-1 flex-col gap-4 p-4 max-w-350 m-auto">
        {courseDetails.data 
          ? <CourseProps course={courseDetails.data} />
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

          {membersPermissions.data && courseDetails.data
            ? <CoursePermissionsActionsAddUser 
              courseId={courseId} 
              members={membersPermissions.data} 
              currentUserPermission={courseDetails.data.role}
            />
            : <Spinner />
          }
        </header>

        {membersPermissions.data && courseDetails.data
          ? <CoursePermissions
            courseId={courseId} 
            members={membersPermissions.data} 
            currentUserPermission={courseDetails.data.role}
          />
          : <WFullSpinner className="w-8 h-8"/>
        }
      </section>

      <div className="py-4">
        <Separator />
      </div>

      <section className="flex flex-1 flex-col gap-4 p-4 max-w-350 m-auto">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Seciones y leciones</h1>
            <p className="text-sm text-muted-foreground">
              Organiza y gestiona las secciones y lecciones del curso
            </p>
          </div>

          {courseDetails.data 
            ? <CreateCourseSectionDialog courseId={courseId!} currentUserPermission={courseDetails.data.role}/>
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
            <h1 className="text-2xl font-bold">Questionarios</h1>
            <p className="text-sm text-muted-foreground">
              Organiza y gestiona questionarios del curso
            </p>
          </div>

          {courseDetails.data 
            ? <CreateQuizDialog courseId={courseId} currentUserPermission={courseDetails.data.role}/>
            : <Spinner />
          }
        </header>

        <QuizzesListFilters 
          filters={quizzesQueryFilters}
          isRefetching={quizzesQuery.isRefetching}
          onFiltersChange={(f) => setQuizzesQueryFilters(f)}
          refetch={quizzesQuery.refetch}
        />

        {/* TODO: Quiz list */}
        {quizzesQuery.data
          ? <QuizList
              quizzes={quizzesQuery.data.pages.flat()}
              courseId={courseId}
              onLoadMore={quizzesQuery.fetchNextPage}
              isFetchingNextPage={quizzesQuery.isFetchingNextPage}
              hasNextPage={quizzesQuery.hasNextPage ?? false}
            />
          : <WFullSpinner className="h-8 w-8" />
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

          {filesQuery.data && courseDetails.data
            ? <FilesDropzoneDialog courseId={courseId!} currentUserPermission={courseDetails.data.role} />
            : <Spinner />
          }    
        </header>

        <FileListFilters
          isRefetching={filesQuery.isRefetching}
          refetch={filesQuery.refetch}
          filters={filesQueryFilters}
          onFiltersChange={(f) => setFilesQueryFilters(f)}
          usernameOptions={membersPermissions.data?.map((u) => u.username)}
        />

        {filesQuery.data
          ? <FileList 
              files={filesQuery.data.pages.flat()} 
              onLoadMore={filesQuery.fetchNextPage}
              isFetchingNextPage={filesQuery.isFetchingNextPage}
              hasNextPage={filesQuery.hasNextPage ?? false}
              canEdit
            />
          : <WFullSpinner className="h-8 w-8"/>
        }
      </section>
    </div>

  )
}