import { Button } from "@/components/ui/button"
import { Library, Check, ShoppingCart, X } from "lucide-react"
import { useGetShoppingCartQuery } from "@/queries/client/shoppingCart/useGetShoppingCartQuery"
import type { WatchCourseResponse } from "@/types/client/courses"
import { useUpdateShoppingCartMutation } from "@/mutations/client/shoppingCart/useUpdateShoppingCartMutation"
import { toast } from "sonner"
import { useContext } from "react"
import { UserContext } from "@/context/user/createUserContext"
import { useNavigate } from "react-router-dom"

interface WatchCourseLibraryButtonProps {
  course: WatchCourseResponse
  disabled?: boolean
}

export const WatchCourseAddToLibraryButton = ({ course, disabled }: WatchCourseLibraryButtonProps) => {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()
  const { data: shoppingCart } = useGetShoppingCartQuery({ username: user?.username, payload: {} }, !disabled)
  const updateShoppingCartMutation = useUpdateShoppingCartMutation()

  const isInCart = shoppingCart?.items.some((item) => {
    return item.course.id === course.id && item.destination === "CurrentUser"
  })

  const toggleAddToCart = () => {
    updateShoppingCartMutation.mutate(
      {
        items: [{
          courseId: course.id,
          destination: "CurrentUser",
          quantity: isInCart ? -1 : 1
        }]
      },
      {
        onSuccess: () => {
          toast.success(isInCart ? 'Curso eliminado correctamente' : 'Curso añadido correctamente')
        }
      }
    )
  }

  if(!user) {
    return (
      <Button className="gap-2 flex-1" onClick={() => navigate('/login')}>
        <ShoppingCart className="size-4"/> 
        Iniciar sesión
      </Button>
    )
  }

  if (course.purchasedAt) {
    return (
      <Button disabled className="gap-2 flex-1">
        <Check className="size-4" />
        {course.isFree ? "Añadido a la biblioteca" : "Comprado"}
      </Button>
    )
  }

  if (course.isFree) {
    return (
      <Button disabled={disabled} className="gap-2 flex-1">
        <Library className="size-4" />
        Añadir a la biblioteca
      </Button>
    )
  }

  return (
    <Button disabled={disabled} className="gap-2 flex-1" onClick={toggleAddToCart}>
      {isInCart ? <>
        <X className="size-4" />
        Eliminar de la cesta
      </> : <>
        <ShoppingCart className="size-4"/> 
        Añadir a la cesta
      </>}
    </Button>
  )
}
