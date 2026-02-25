import { useFormContext, useFieldArray } from "react-hook-form"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Trash2, GripVertical, Plus, ChevronUp, ChevronDown } from "lucide-react"
import { DndUtils } from "@/lib/dndUtils"
import type { QuizQuestionOrderingFormSchema } from "../createQuestionFormSchemas"
import { cn } from "@/lib/utils"


export function OrderingForm() {
  const { control, formState: { errors }, watch } = useFormContext<QuizQuestionOrderingFormSchema>()
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "options.items"
  })
  const items = watch("options.items")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  const addItem = () => {
    append({ value: "" })
  }

  const removeItem = (index: number) => {
    remove(index)
  }

  const moveItem = (index: number, direction: "up" | "down") => {
    const movedItems = [...items]
    if (direction === "up" && index > 0) {
      [movedItems[index], movedItems[index - 1]] = [movedItems[index - 1], movedItems[index]]
    } else if (direction === "down" && index < movedItems.length - 1) {
      [movedItems[index], movedItems[index + 1]] = [movedItems[index + 1], movedItems[index]]
    }

    movedItems.forEach((item, i) => update(i, item))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((_, i) => DndUtils.dialogQuizQuestionId(i) === active.id)
      const newIndex = items.findIndex((_, i) => DndUtils.dialogQuizQuestionId(i) === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex)
        newItems.forEach((item, i) => update(i, item))
      }
    }
  }

  const globalErrMsg = errors.options?.items?.root?.message || errors.options?.items?.message

  return (
    <Field>
      <FieldLabel>Elementos en orden correcto</FieldLabel>
      <FieldContent>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((_, i) => DndUtils.dialogQuizQuestionId(i))} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <SortableItem
                  key={field.id}
                  id={DndUtils.dialogQuizQuestionId(index)}
                  index={index}
                  onRemove={removeItem}
                  onMove={moveItem}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className={cn(fields.length ? 'mt-3' : '')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar elemento
        </Button>

        <FieldDescription className="mt-2">
          Define el orden correcto. Arrastra los elementos para reordenarlos o usa los botones de flecha. Los estudiantes deberán ordenar los elementos en este orden. Añade al menos 2 elementos.
        </FieldDescription>

        {globalErrMsg && (
          <FieldError>{globalErrMsg}</FieldError>
        )}
      </FieldContent>
    </Field>
  )
}

interface SortableItemProps {
  id: string
  index: number
  onRemove: (index: number) => void
  onMove: (index: number, direction: "up" | "down") => void
  isFirst: boolean
  isLast: boolean
}

function SortableItem({
  id,
  index,
  onRemove,
  onMove,
  isFirst,
  isLast,
}: SortableItemProps) {
  const { register, trigger, formState: { errors } } = useFormContext<QuizQuestionOrderingFormSchema>()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 p-2 border rounded-lg bg-muted/30"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
      <span className="text-sm font-medium text-muted-foreground min-w-6">{index + 1}.</span>
      <div className="flex-1">
        <Input
          placeholder={`Elemento ${index + 1}`}
          {...register(`options.items.${index}.value`, { onChange: () => trigger("options.items") })}
          onPointerDown={(e) => e.stopPropagation()}
        />
        {errors.options?.items?.[index]?.value?.message && (
          <p className="text-destructive text-xs mt-1">{errors.options?.items?.[index]?.value?.message}</p>
        )}
      </div>
      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onMove(index, "up")}
          disabled={isFirst}
          title="Mover arriba"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onMove(index, "down")}
          disabled={isLast}
          title="Mover abajo"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}