import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useCreateCourseMutation } from "@/mutations/dashboard/courses/useCreateCourseMutation"
import { createCourseModalSchema, type CreateCourseModalSchema } from "./createCourseModalSchema"
import { COURSE_LANGUAGES, type CourseLanguage, type CourseVisibility } from "@/types/common/courses"
import { formatCourseVisibility, formatLanguage } from "@/lib/format"

const VISIBILITY_OPTIONS: { value: CourseVisibility; label: string; description: string }[] = [
  {
    value: "Private",
    label: formatCourseVisibility('Private'),
    description: "Solo tú puedes ver este curso"
  },
  {
    value: "Link",
    label: formatCourseVisibility('Link'),
    description: "Solo personas con el enlace pueden ver este curso"
  },
  {
    value: "Public",
    label: formatCourseVisibility('Public'),
    description: "Cualquiera puede ver este curso"
  }
]

export function CreateCourseModal() {
  const [isOpen, setIsOpen] = useState(false)
  const createMutation = useCreateCourseMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreateCourseModalSchema>({
    resolver: zodResolver(createCourseModalSchema),
    defaultValues: { 
      title: "", 
      description: "", 
      visibility: "Private",
      language: "es"
    },
    mode: "onBlur",
  })

  const formValues = watch()

  const onSubmit = (values: CreateCourseModalSchema) => {
    createMutation.mutate(values)
    setIsOpen(false)
    reset()
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      reset()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          Crear curso
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col">
        <DialogHeader>
          <DialogTitle>Crear nuevo curso</DialogTitle>
          <DialogDescription>
            Completa la información básica para crear tu nuevo curso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 flex flex-col">
          <Field>
            <FieldLabel htmlFor="title">Título del curso</FieldLabel>
            <FieldContent>
              <Input
                id="title"
                type="text"
                placeholder="Ej: Introducción a React"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              <FieldError errors={[errors.title]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Descripción</FieldLabel>
            <FieldContent>
              <Textarea
                id="description"
                placeholder="Describe de qué trata tu curso..."
                rows={3}
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              <FieldError errors={[errors.description]} />
            </FieldContent>
          </Field>
      
          <div className="flex items-center flex-wrap justify-between gap-4">
            <Field className="w-full/2">
              <FieldLabel>Visibilidad</FieldLabel>
              <FieldContent>
                <Select
                  value={formValues.visibility}
                  onValueChange={(value: CourseVisibility) => setValue("visibility", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la visibilidad" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {VISIBILITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.visibility]} />
              </FieldContent>
            </Field>

            <Field className="w-full/2">
              <FieldLabel>Idioma</FieldLabel>
              <FieldContent>
                <Select
                  value={formValues.language}
                  onValueChange={(value: CourseLanguage) => setValue("language", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el idioma" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {COURSE_LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        <p className="font-medium">{formatLanguage(lang)}</p> 
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.language]} />
              </FieldContent>
            </Field>
          </div>


          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Crear curso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}