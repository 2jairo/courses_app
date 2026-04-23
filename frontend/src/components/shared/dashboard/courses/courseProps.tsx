import { useEffect, useMemo, useState } from "react"
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

import type { CourseResponseExtended, UpdateCourseRequest } from "@/types/dashboard/courses"
import { useUpdateCourseMutation } from "@/mutations/dashboard/courses/useUpdateCourseMutation"
import { zodResolver } from "@hookform/resolvers/zod"
import { DCP } from "@/lib/dashboardCoursePermissions"
import { COURSE_LANGUAGES, type CourseLanguage, type CourseLecturesAccesibility, type CourseVisibility } from "@/types/common/courses"
import { ImageGallery } from "../../imageGallery/imageGallery"
import { Dialog, DialogContent,  DialogTitle,  DialogTrigger } from "@/components/ui/dialog"
import { ImageOff, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilesDropzoneContent } from "../../files/fillesDropzoneContent"
import type { GetFilesRequest } from "@/types/dashboard/files"
import { useFilesQuery } from "@/queries/dashboard/files/useFilesQuery"
import { FileListFilters } from "../../files/filesListFilters"
import { useDashboardCoursePermissionsQuery } from "@/queries/dashboard/coursePermissions/useCoursePermissions"
import { chooseClosestImageResolution } from "@/lib/imageResolution"
import { formatLanguage } from "@/lib/format"
import { COURSE_LECTURES_ACCESIBILITY_OPTIONS, COURSE_VISIBILITY_OPTIONS, modifyCoursePropsSchema, type ModifyCoursePropsSchema } from "./courseCreateOrUpdateFormSchema"
import { MultiTagsInput } from "@/components/ui/multi-tags-input"
import { useTagsInfiniteQuery } from "@/queries/dashboard/courseTags/useTagsInfiniteQuery"
import type { GetTagsRequest } from "@/types/dashboard/courseTag"
import { MAX_COURSE_TAG_LENGTH, MAX_COURSE_TAGS, MIN_COURSE_TAG_LENGTH } from "@/types/common/tags"

interface ModifyCoursePropsProps {
  course: CourseResponseExtended
}
type ImageTab = 'gallery' | 'upload'

const hasSameTags = (
  nextTags: { label: string, value: string }[] | undefined,
  baseTags: { label: string, value: string }[]
) => {
  const a = nextTags ?? []

  if (a.length !== baseTags.length) {
    return false
  }

  return a.every((tag, index) => tag.value === baseTags[index]?.value && tag.label === baseTags[index]?.label)
}

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

  const [tagsQueryFilters, setTagsQueryFilters] = useState<GetTagsRequest>({})
  const tagsQuery = useTagsInfiniteQuery(tagsQueryFilters)
  const tagsData = (tagsQuery.data?.pages || [])
    .flat()
    .map((t) => ({ label: t.slug, value: t.name }))
  const courseTags = useMemo(
    () => course.tags.map((tag) => ({ label: tag.slug, value: tag.name })),
    [course.tags]
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState,
  } = useForm<ModifyCoursePropsSchema>({
    resolver: zodResolver(modifyCoursePropsSchema),
    defaultValues: {
      title: course.title,
      description: course.description,
      visibility: course.visibility,
      lectureAccesibility: course.lectureAccesibility,
      language: course.language,
      price: course.price / 100, // convert cents to euro
      discountPercent: course.discountPercent,
      tags: courseTags,
    },
  })

  const formValues = watch()
  const priceValue = formValues.price || 0
  const discountValue = formValues.discountPercent || 0
  const finalPriceValue = Math.max(0, priceValue - (priceValue * discountValue / 100))

  const selectedAccesibility = COURSE_LECTURES_ACCESIBILITY_OPTIONS.find((a) => a.value === formValues.lectureAccesibility)
  const selectedVisibility = COURSE_VISIBILITY_OPTIONS.find((v) => v.value === formValues.visibility) 

  const getPosterUrl = (values: ModifyCoursePropsSchema) => {
    if(values.posterFile === null) {
      return null
    }
    if (values.posterFile) {
      const img = chooseClosestImageResolution((values.posterFile.kind === 'Image' ? values.posterFile.metadata.resolutions : {}) ?? {}, 'large')
      return `${values.posterFile.cdn.base}/${img?.path}`
    }
    return course.poster
  }
  const posterUrl = getPosterUrl(formValues)

  useEffect(() => {
    if(hasChanged) {
      return
    }
    
    reset({
      title: course.title,
      description: course.description,
      visibility: course.visibility,
      lectureAccesibility: course.lectureAccesibility,
      language: course.language,
      price: course.price / 100,
      discountPercent: course.discountPercent,
      posterFile: undefined,
      tags: courseTags,
    })
  }, [course, courseTags, hasChanged, reset])

  useEffect(() => {
    setHasChanged(
      formValues.title !== course.title ||
      formValues.description !== course.description ||
      formValues.posterFile !== undefined ||
      formValues.visibility !== course.visibility ||
      formValues.lectureAccesibility !== course.lectureAccesibility ||
      formValues.language !== course.language ||
      formValues.price !== course.price / 100 ||
      formValues.discountPercent !== course.discountPercent ||
      !hasSameTags(formValues.tags, courseTags)
    )
  }, [formValues, course, courseTags])

  const onSubmitEdit = (formValues: ModifyCoursePropsSchema) => {
    const values: UpdateCourseRequest = {
      courseId: course.id
    }
    if(formValues.title !== course.title) {
      values.title = formValues.title
    }
    if(formValues.description !== course.description) {
      values.description = formValues.description
    }
    if(formValues.posterFile !== undefined) {
      values.posterFileId = formValues.posterFile?.id ?? -1
    }
    if(formValues.visibility !== course.visibility) {
      values.visibility = formValues.visibility
    }
    if(formValues.lectureAccesibility !== course.lectureAccesibility) {
      values.lectureAccesibility = formValues.lectureAccesibility
    }
    if(formValues.language !== course.language) {
      values.language = formValues.language
    }
    if(formValues.price !== undefined && formValues.price !== course.price / 100) {
      values.price = Math.round(formValues.price * 100)
    }
    if(formValues.discountPercent !== undefined && formValues.discountPercent !== course.discountPercent) {
      values.discountPercent = formValues.discountPercent
    }
    if(!hasSameTags(formValues.tags, courseTags)) {
      values.tags = (formValues.tags ?? []).map((tag) => ({ name: tag.value }))
    }

    updateMutation.mutate(
      values,
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
  const uploadDisabled = !DCP.canUploadFiles(course.role)

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

          <Button type="submit" disabled={updateMutation.isLoading || !hasChanged || !DCP.canModifyCourseProps(course.role)}>
            {updateMutation.isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-4 md:flex-row">
        <section className="space-y-2 md:w-auto">
          <Dialog open={imageGalleryOpen} onOpenChange={setImageGalleryOpen}>
            {posterUrl ? (
              <>
                <DialogTrigger asChild>
                  <img 
                    src={posterUrl} 
                    alt="Course poster" 
                    className="w-full md:max-w-96 h-64 object-cover rounded-lg border cursor-pointer"
                  />
                </DialogTrigger>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValue('posterFile', null)}
                  className="w-full"
                >
                  <X className="w-4 h-4" />
                  Quitar imagen
                </Button>
              </>
            ) : (
              <DialogTrigger asChild>
                <div 
                  className="cursor-pointer w-full md:w-64 h-64 bg-muted rounded-lg border gap-2 flex flex-col items-center justify-center text-muted-foreground text-sm"
                >
                  <ImageOff className="w-12 h-12" />
                  <p>Sin imagen</p>
                  <p>Click para añadir o modificar</p>
                </div>
              </DialogTrigger>
            )}

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
                      isRefetching={filesQuery.isRefetching}
                      refetch={filesQuery.refetch}
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
                      onRowClick={(f) => setValue('posterFile', f)}
                      selectedFiles={formValues.posterFile ? [formValues.posterFile] : []}
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
        </section>

        <section className="flex-1 space-y-4">
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

          <div className="flex flex-col gap-4 xl:flex-row">
            <Field className="flex-1">
              <FieldLabel htmlFor="price">Precio €</FieldLabel>
              <FieldContent>
                <Input 
                  id="price" 
                  type="number" 
                  min="0"
                  placeholder="9.99"
                  {...register("price", { valueAsNumber: true })} 
                />
                <FieldError errors={[formState.errors.price]}/>
              </FieldContent>
            </Field>

            <Field className="flex-1">
              <FieldLabel htmlFor="discountPercent">Descuento (%)</FieldLabel>
              <FieldContent>
                <Input 
                  id="discountPercent" 
                  type="number" 
                  min="0"
                  max="100"
                  placeholder="20"
                  {...register("discountPercent", { valueAsNumber: true })} 
                />
                <FieldError errors={[formState.errors.discountPercent]}/>
              </FieldContent>
            </Field>

            <div className="flex-1 flex flex-col justify-end">
              <div className="flex items-center justify-end bg-muted/50 p-3 rounded-md border border-border h-10 w-full mb-[0.125rem]">
                <span className="text-sm font-medium pr-2">Total:</span>
                {discountValue > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm line-through text-muted-foreground">
                      {priceValue.toFixed(2)}€
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-500">
                      {finalPriceValue.toFixed(2)}€
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold">
                    {priceValue.toFixed(2)}€
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 xl:flex-row">
            <Field className="flex-1/2">
              <FieldLabel htmlFor="visibility">Visibilidad</FieldLabel>
              <FieldContent>
                <Select
                  value={formValues.visibility}
                  onValueChange={(value) =>
                    setValue("visibility", value as CourseVisibility)
                  }
                >
                  <SelectTrigger id="visibility" className="w-full">
                    <div className="flex-1 w-full min-w-0 flex justify-between flex-col items-center">
                      {selectedVisibility && (
                        <>
                          <div className="font-medium">{selectedVisibility.label}</div>
                          <div className="text-xs text-muted-foreground">{selectedVisibility.description}</div>
                        </>
                      )}
                    </div>

                  </SelectTrigger>
                  <SelectContent position="popper">
                    {COURSE_VISIBILITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError errors={[formState.errors.visibility]}/>
              </FieldContent>
            </Field>

            <Field className="flex-1/2">
              <FieldLabel htmlFor="accesibility">Accesibilidad de lecciones</FieldLabel>
              <FieldContent>
                <Select
                  value={formValues.lectureAccesibility}
                  onValueChange={(value) =>
                    setValue("lectureAccesibility", value as CourseLecturesAccesibility)
                  }
                >
                  <SelectTrigger id="accesibility" className="w-full">
                    <div className="flex-1 w-full min-w-0 flex justify-between flex-col items-center">
                      {selectedAccesibility && (
                        <>
                          <div className="font-medium">{selectedAccesibility.label}</div>
                          <div className="text-xs text-muted-foreground">{selectedAccesibility.description}</div>
                        </>
                      )}
                    </div>
                  </SelectTrigger>

                  <SelectContent position="popper">
                    {COURSE_LECTURES_ACCESIBILITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError errors={[formState.errors.lectureAccesibility]}/>
              </FieldContent>
            </Field>

            <Field className="w-fit">
              <FieldLabel htmlFor="language">Idioma</FieldLabel>
              <FieldContent>
                <Select
                  value={formValues.language}
                  onValueChange={(value) =>
                    setValue("language", value as CourseLanguage)
                  }
                >
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {COURSE_LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        <p className="font-medium">{formatLanguage(lang)}</p>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[formState.errors.language]}/>
              </FieldContent>
            </Field>
          </div>

          <div>
            <Field className="flex-1">
              <FieldLabel htmlFor="tags">Etiquetas</FieldLabel>
              <FieldContent>    
                <MultiTagsInput
                  value={formValues.tags ?? []}
                  options={tagsData}
                  fetchNextPage={tagsQuery.fetchNextPage}
                  hasNextPage={tagsQuery.hasNextPage}
                  isFetchingNextPage={tagsQuery.isFetchingNextPage}
                  minTagLength={MIN_COURSE_TAG_LENGTH}
                  maxTagLength={MAX_COURSE_TAG_LENGTH}
                  maxTags={MAX_COURSE_TAGS}
                  onInputChange={(input) => setTagsQueryFilters({ q: input.trim() })}
                  createOption={(tag) => ({ label: tag, value: tag })}
                  onChange={(t) => setValue("tags", t, { shouldDirty: true, shouldValidate: true })}
                />
                <FieldError errors={[formState.errors.tags as { message?: string } | undefined]}/>
              </FieldContent>
            </Field>
          </div>
        </section>
      </div>

    </form>
  )
}