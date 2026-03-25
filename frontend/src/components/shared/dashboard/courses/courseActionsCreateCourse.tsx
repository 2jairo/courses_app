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
import { COURSE_LANGUAGES, type CourseLanguage, type CourseLecturesAccesibility, type CourseVisibility } from "@/types/common/courses"
import { formatLanguage } from "@/lib/format"
import { COURSE_LECTURES_ACCESIBILITY_OPTIONS, COURSE_VISIBILITY_OPTIONS, createCourseFormSchema, type CreateCourseFormSchema } from "./courseCreateOrUpdateFormSchema"
import { useNavigate } from "react-router-dom"

export function CreateCourseModal() {
  const [isOpen, setIsOpen] = useState(false)
  const createMutation = useCreateCourseMutation()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreateCourseFormSchema>({
    resolver: zodResolver(createCourseFormSchema),
    defaultValues: { 
      title: "", 
      description: "", 
      visibility: "Private",
      lectureAccesibility: "Open",
      language: "es",
      price: 0,
      discountPercent: 0
    },
    mode: "onBlur",
  })

  const formValues = watch()
  const priceValue = formValues.price || 0
  const discountValue = formValues.discountPercent || 0
  const finalPriceValue = Math.max(0, priceValue - (priceValue * discountValue / 100))

  const onSubmit = (values: CreateCourseFormSchema) => {
    // Send price in cents
    const dataToSend = {
      ...values,
      price: Math.round(values.price * 100)
    }
    
    createMutation.mutate(dataToSend, {
      onSuccess: (resp) => {
        setIsOpen(false)
        navigate(`/dashboard/courses/${resp.id}`)
      }
    })
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
      
          <Field className="w-full">
            <FieldLabel>Accesibilidad de lecciones</FieldLabel>
            <FieldContent>
              <Select
                value={formValues.lectureAccesibility}
                onValueChange={(value: CourseLecturesAccesibility) => setValue("lectureAccesibility", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona la accesibilidad" />
                </SelectTrigger>
                <SelectContent position="popper" className="w-full">
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
              <FieldError errors={[errors.lectureAccesibility]} />
            </FieldContent>
          </Field>

          <div className="flex items-start flex-wrap justify-between gap-4">
            <Field className="flex-1">
              <FieldLabel>Visibilidad</FieldLabel>
              <FieldContent>
                <Select
                  value={formValues.visibility}
                  onValueChange={(value: CourseVisibility) => setValue("visibility", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona la visibilidad" />
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
                <FieldError errors={[errors.visibility]} />
              </FieldContent>
            </Field>

            <Field className="flex-1">
              <FieldLabel>Idioma</FieldLabel>
              <FieldContent>
                <Select
                  value={formValues.language}
                  onValueChange={(value: CourseLanguage) => setValue("language", value)}
                >
                  <SelectTrigger className="w-full">
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

          <div className="flex items-start flex-wrap justify-between gap-4">
            <Field className="flex-1">
              <FieldLabel htmlFor="price">Precio (€)</FieldLabel>
              <FieldContent>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="9.99"
                  aria-invalid={!!errors.price}
                  {...register("price", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.price]} />
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
                  aria-invalid={!!errors.discountPercent}
                  {...register("discountPercent", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.discountPercent]} />
              </FieldContent>
            </Field>
          </div>

          <div className="flex items-center justify-end bg-muted/50 p-3 rounded-md border border-border">
            <span className="text-sm font-medium pr-2">Precio final:</span>
            {discountValue > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-sm line-through text-muted-foreground">
                  {priceValue.toFixed(2)}€
                </span>
                <span className="text-lg font-bold text-green-600">
                  {finalPriceValue.toFixed(2)}€
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold">
                {priceValue.toFixed(2)}€
              </span>
            )}
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