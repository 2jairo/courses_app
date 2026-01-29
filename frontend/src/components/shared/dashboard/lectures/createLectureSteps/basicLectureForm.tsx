import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Video, FileText, Brain, Code2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

import { basicLectureFormSchema, type BasicLectureFormSchema } from "./createLectureFormSchemas"
import type { LectureKind, LectureVisibility } from "@/types/common/lectures"

interface BasicLectureFormProps {
  initialData?: BasicLectureFormSchema | null
  onSubmit: (data: BasicLectureFormSchema) => void
  isSubmitting: boolean
}

export function BasicLectureForm({ initialData, onSubmit, isSubmitting }: BasicLectureFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BasicLectureFormSchema>({
    resolver: zodResolver(basicLectureFormSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      visibility: "Public",
      lectureKind: "Video",
    },
  })

  const selectedKind = watch("lectureKind")

  const lectureKindOptions = [
    { value: "Video", label: "Video", icon: Video, description: "Lección basada en contenido de video" },
    { value: "Document", label: "Documento", icon: FileText, description: "Lección con contenido de texto enriquecido" },
    { value: "Quiz", label: "Quiz", icon: Brain, description: "Evaluación con preguntas interactivas" },
    { value: "Lab", label: "Laboratorio", icon: Code2, description: "Ejercicio práctico de programación" },
  ] as const

  const visibilityOptions = [
    { value: "Public", label: "Público", description: "Visible para todos los estudiantes" },
    { value: "Link", label: "Por enlace", description: "Solo accesible con enlace directo" },
    { value: "Private", label: "Privado", description: "Solo visible para instructores" },
  ] as const

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Field>
        <FieldLabel htmlFor="title">Título de la lección</FieldLabel>
        <FieldContent>
          <Input
            id="title"
            placeholder="Ej: Introducción a React Hooks"
            {...register("title")}
            disabled={isSubmitting}
          />
          <FieldDescription>
            Escribe un título claro y descriptivo para esta lección
          </FieldDescription>
          {errors.title && <FieldError>{errors.title.message}</FieldError>}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="description">Descripción</FieldLabel>
        <FieldContent>
          <Textarea
            id="description"
            placeholder="Describe qué aprenderán los estudiantes en esta lección..."
            rows={3}
            {...register("description")}
            disabled={isSubmitting}
          />
          <FieldDescription>
            Proporciona una descripción detallada del contenido y objetivos de la lección
          </FieldDescription>
          {errors.description && <FieldError>{errors.description.message}</FieldError>}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>Visibilidad</FieldLabel>
        <FieldContent> 
          <Select 
            value={watch("visibility")} 
            onValueChange={(value) => setValue("visibility", value as LectureVisibility)}
          >
            <SelectTrigger className="w-full flex items-center justify-center">
              <SelectValue/>
            </SelectTrigger>
            <SelectContent position="popper">
              {visibilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.visibility && <FieldError>{errors.visibility.message}</FieldError>}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>Tipo de lección</FieldLabel>
        <FieldContent>
          <div className="grid grid-cols-2 gap-3">
            {lectureKindOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedKind === option.value
              
              return (
                <Card 
                  key={option.value}
                  className={`p-0 cursor-pointer transition-colors border-2 ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setValue("lectureKind", option.value as LectureKind)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {option.label}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {errors.lectureKind && <FieldError>{errors.lectureKind.message}</FieldError>}
        </FieldContent>
      </Field>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          Continuar
        </Button>
      </div>
    </form>
  )
}