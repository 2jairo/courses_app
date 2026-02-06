import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { CourseResponseExtended } from "@/types/dashboard/courses"
import { useUpdateCourseMutation } from "@/mutations/dashboard/courses/useUpdateCourseMutation"
import { modifyCoursePropsSchema, type ModifyCoursePropsSchema } from "./coursePropsSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { CP } from "@/lib/permissions"
import type { CourseVisibility } from "@/types/common/courses"
import { ImageGallery } from "../../imageGallery/imageGallery"
import { Dialog, DialogContent,  DialogTitle,  DialogTrigger } from "@/components/ui/dialog"
import { Image } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilesDropzoneContent } from "../../files/fillesDropzoneContent"
import type { GetFilesRequest } from "@/types/dashboard/files"
import { useFilesQuery } from "@/queries/dashboard/files/useFilesQuery"
import { FileListFilters } from "../../files/filesListFilters"
import { useDashboardCoursePermissionsQuery } from "@/queries/dashboard/coursePermissions/useCoursePermissions"

interface ModifyCoursePropsProps {
  course: CourseResponseExtended
}
type ImageTab = 'gallery' | 'upload'

export function CourseProps({ course }: ModifyCoursePropsProps) {
  const [hasChanged, setHasChanged] = useState(false)
  const [imageTab, setImageTab] = useState<ImageTab>('gallery')
  const updateMutation = useUpdateCourseMutation()

  const [imageGalleryOpen, setImageGalleryOpen] = useState(false)
  const usersWithPermissionsQuery = useDashboardCoursePermissionsQuery({ courseId: imageGalleryOpen ? course.id : 0 })
  const [filesQueryFilters, setFilesQueryFilters] = useState<Omit<GetFilesRequest, 'courseId'>>({ 
    sortBy: "date",
    sortOrder: "desc",
    kind: ["Image"],
    q: null,
    status: ["Ready"],
    user: []
  })
  const filesQuery = useFilesQuery({ courseId: imageGalleryOpen ? course.id : 0, ...filesQueryFilters })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState
  } = useForm<ModifyCoursePropsSchema>({
    resolver: zodResolver(modifyCoursePropsSchema),
    defaultValues: {
      title: course.title,
      description: course.description,
      visibility: course.visibility,
    },
  })

  const formValues = watch()

  useEffect(() => {
    setHasChanged(
      formValues.title !== course.title ||
      formValues.description !== course.description ||
      formValues.posterFileId !== undefined ||
      formValues.visibility !== course.visibility
    )
  }, [formValues, course])

  const onSubmitEdit = (formValues: ModifyCoursePropsSchema) => {
    const values: ModifyCoursePropsSchema = {}
    if(formValues.title !== course.title) {
      values.title = formValues.title
    }
    if(formValues.description !== course.description) {
      values.description = formValues.description
    }
    if(formValues.posterFileId !== undefined) {
      values.posterFileId = formValues.posterFileId
    }
    if(formValues.visibility !== course.visibility) {
      values.visibility = formValues.visibility
    }

    updateMutation.mutate(
      {
        ...values,
        courseId: course.id,
      },
      {
        onSuccess: () => {
          toast.success("Curso actualizado correctamente")
          setHasChanged(false)
        }
      }
    )
  }
 
  const handleCancel = () => {
    reset()
    setHasChanged(false)
  }
  const uploadDisabled = !CP.canUploadFiles(course.role)

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmitEdit)}>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Propiedades básicas</h1>
          <p className="text-sm text-muted-foreground">
            Modifica las propiedades básicas del curso
          </p>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateMutation.isLoading || !hasChanged}
          >
            Cancelar
          </Button>

          <Button type="submit" disabled={updateMutation.isLoading || !hasChanged || !CP.canModifyCourseProps(course.role)}>
            {updateMutation.isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </header>

      <section className="space-y-4">
        <Field>
          <FieldLabel htmlFor="title">Título</FieldLabel>
          <FieldContent>
            <Input id="title" {...register("title", { required: true })} />
            <FieldError errors={[formState.errors.title]}/>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Descripción</FieldLabel>
          <FieldContent>
            <Textarea
              id="description"
              rows={3}
              {...register("description", { required: true })}
            />
            <FieldError errors={[formState.errors.description]}/>
          </FieldContent>
        </Field>
        
        <div className="flex gap-4">
          <Dialog open={imageGalleryOpen} onOpenChange={setImageGalleryOpen}>
            <DialogTrigger asChild>
              <div className="flex flex-col gap-2 justify-between">
                <p className="text-sm">Poster</p>
                
                <Button type="button">
                  <Image />
                  Imagen
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent className="min-w-[60vw]"> 
              <DialogTitle>
                Imágenes
              </DialogTitle>

              <Tabs onValueChange={(v) => setImageTab(v as ImageTab)} value={imageTab} className="gap-4">
                <TabsList className="w-full">
                  <TabsTrigger value="gallery" className="w-full">
                    Galería
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="w-full">
                    Subir
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="gallery">
                  <div className="max-h-[60vh] overflow-auto flex flex-col gap-4">
                    <FileListFilters
                      disabledFilters={["kind", "status"]}
                      filters={filesQueryFilters}
                      onFiltersChange={(f) => setFilesQueryFilters(f)}
                      usernameOptions={usersWithPermissionsQuery.data?.map((u) => u.username)}
                    />

                    <ImageGallery
                      files={(filesQuery.data?.pages || []).flat()}
                      hasNextPage={filesQuery.hasNextPage ?? false}
                      isFetchingNextPage={filesQuery.isFetchingNextPage}
                      onLoadMore={filesQuery.fetchNextPage}
                      onRowClick={(f) => setValue('posterFileId', f.id)}
                      selectedFiles={formValues.posterFileId ? [{ id: formValues.posterFileId }] : []}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="upload">
                  <FilesDropzoneContent 
                    courseId={course.id}
                    onSuccess={() => setImageTab('gallery')}
                    uploadDisabled={uploadDisabled}
                    image
                  />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Field className="w-auto">
            <FieldLabel htmlFor="visibility">Visibilidad</FieldLabel>
            <FieldContent>
              <Select
                value={formValues.visibility}
                onValueChange={(value) =>
                  setValue("visibility", value as CourseVisibility)
                }
              >
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="Private">Privado</SelectItem>
                  <SelectItem value="Link">Con enlace</SelectItem>
                  <SelectItem value="Public">Público</SelectItem>
                </SelectContent>
              </Select>

              <FieldError errors={[formState.errors.visibility]}/>
            </FieldContent>
          </Field>
        </div>

      </section>
    </form>
  )
}