import { useContext, useState } from "react"
import { Gift, Minus, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { useGetShoppingCartQuery } from "@/queries/client/shoppingCart/useGetShoppingCartQuery"
import { useUpdateShoppingCartMutation } from "@/mutations/client/shoppingCart/useUpdateShoppingCartMutation"
import { ButtonGroup } from "@/components/ui/button-group"
import { UserContext } from "@/context/user/createUserContext"

interface WatchCourseGiftDialogProps {
  courseId: number
  disabled?: boolean
}

export const WatchCourseGiftDialog = ({ courseId, disabled }: WatchCourseGiftDialogProps) => {
  const { user } = useContext(UserContext)
  const [open, setOpen] = useState(false)
  
  const { data: cartResponse, isLoading } = useGetShoppingCartQuery({ username: user?.username, payload: {} }, !disabled)
  const updateShoppingCartMutation = useUpdateShoppingCartMutation()

  const items = cartResponse?.items || []
  
  // Find current gift item in cart if exists
  const existingGiftItem = items.find(
    (item) => item.course.id === courseId && item.destination === "Gift"
  )
  
  const [quantity, setQuantity] = useState(existingGiftItem ? existingGiftItem.quantity : 1)

  // Sync quantity state when opening the dialog
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setQuantity(existingGiftItem ? existingGiftItem.quantity : 1)
    }
  }

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1)
    }
  }

  const handleIncrease = () => {
    setQuantity((q) => q + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    if (!isNaN(val) && val >= 1) {
      setQuantity(val)
    }
  }

  const handleUpdateCart = () => {
    
    updateShoppingCartMutation.mutate(
      {
        items: [{ courseId, destination: "Gift", quantity }]
      },
      {
        onSuccess: () => {
          toast.success('Carrito actualizado correctamente')
          setOpen(false)
        }
      }
    )
  }

  const isUpdating = updateShoppingCartMutation.isLoading || isLoading

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="icon" disabled={disabled} className="disabled:pointer-events-auto">
              <Gift />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent className="z-999">
          <div className="flex items-center gap-2">
            Regalar
          </div>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="gap-0">
        <DialogHeader>
          <DialogTitle>Regalar curso</DialogTitle>
          <DialogDescription>
            Agrega este curso a tu carrito para enviarlo como regalo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 flex items-center gap-4">
          <p className="text-muted-foreground">Cantidad a regalar:</p>
          <ButtonGroup className="flex items-center">
            <Button 
              variant="outline" 
              onClick={handleDecrease}
              disabled={quantity <= 1 || isUpdating}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input 
              className="px-2 text-center" 
              value={quantity} 
              onChange={handleInputChange}
              disabled={isUpdating}
            />
            <Button 
              variant="outline" 
              onClick={handleIncrease}
              disabled={isUpdating}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </ButtonGroup>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" disabled={isUpdating}>Cancelar</Button>
          </DialogClose>
          <Button onClick={handleUpdateCart} disabled={isUpdating}>
            {existingGiftItem ? "Actualizar carrito" : "Añadir al carrito como regalo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
