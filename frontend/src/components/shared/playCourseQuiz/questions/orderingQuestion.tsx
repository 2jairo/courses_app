import { useState, useEffect } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  closestCenter,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSetAnswerMutation } from "@/mutations/client/quizzes/useSetAnswerMutation"
import type { StartQuizAttemptResponseQuestion } from "@/types/client/quizzes"

interface SortableItemProps {
  id: string
  value: string
  index: number
}

function SortableItem({ id, value, index }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border p-3 bg-background select-none ${
        isDragging ? "opacity-50 shadow-lg border-primary" : ""
      }`}
    >
      <span className="text-sm font-medium text-muted-foreground min-w-6">{index + 1}.</span>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        aria-label="Reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 text-sm">{value}</span>
    </div>
  )
}

interface OrderingQuestionProps {
  question: StartQuizAttemptResponseQuestion & { kind: "Ordering" }
  lectureSlug: string
  onAnswered: () => void
}

export function OrderingQuestion({ question, lectureSlug, onAnswered }: OrderingQuestionProps) {
  const setAnswerMutation = useSetAnswerMutation()

  const initialItems = (() => {
    if (question.answer?.choicesId?.length) {
      return question.answer.choicesId.map((id) => {
        const found = question.options.items.find((item) => item.id === id)
        return found ?? { id, value: id }
      })
    }

    return [...question.options.items]
  })()

  const [items, setItems] = useState(initialItems)

  useEffect(() => {
    setItems(initialItems)
  }, [question.position])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id)
        const newIndex = prev.findIndex((item) => item.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAnswerMutation.mutate(
      {
        lectureSlug,
        questionId: question.id,
        kind: "Ordering",
        answer: { choicesId: items.map((item) => item.id) },
      },
      { onSuccess: onAnswered }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Arrastra los elementos para ordenarlos correctamente.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <SortableItem key={item.id} id={item.id} value={item.value} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button type="submit" disabled={setAnswerMutation.isLoading} className="w-full">
        {setAnswerMutation.isLoading ? "Guardando..." : "Guardar respuesta"}
      </Button>
    </form>
  )
}
