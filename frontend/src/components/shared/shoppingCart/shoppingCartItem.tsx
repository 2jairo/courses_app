import { Trash2, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatShoppingCartItemDestination } from "@/lib/format"
import type { ShoppingCartItemResponse } from "@/types/client/shoppingCart"
import { ButtonGroup } from "@/components/ui/button-group"
import { Link } from "react-router-dom"
import type { Dispatch } from "react"
import { useUpdateShoppingCartMutation } from "@/mutations/client/shoppingCart/useUpdateShoppingCartMutation"
import { discountedPrice } from "@/lib/discountedPrice"
import { cn } from "@/lib/utils"

interface ShoppingCartItemProps {
  item: ShoppingCartItemResponse
  disableQuantityBtns?: boolean
  hideDeleteBtn?: boolean
  className?: string
  setModalOpen?: Dispatch<boolean>
}

export const ShoppingCartItem = ({ item, disableQuantityBtns, hideDeleteBtn, className, setModalOpen }: ShoppingCartItemProps) => {
  const updateShoppingCartMutation = useUpdateShoppingCartMutation()
  const { course, destination, quantity } = item

  const isCurrentUser = destination === "CurrentUser"

  const handleUpdateQuantity = (quantity: number) => {
    updateShoppingCartMutation.mutate(
      {
        items: [{ courseId: item.course.id, destination: item.destination, quantity }]
      }
    )
  }

  const handleDecrease = () => {
    if (quantity > 1) {
      handleUpdateQuantity(quantity - 1)
    }
  }

  const handleIncrease = () => {
    handleUpdateQuantity(quantity + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    if (!isNaN(val) && val >= 1) {
      if (isCurrentUser && val > 1) return
      handleUpdateQuantity(val)
    }
  }

  return (
    <div className={cn("flex gap-4 py-4", className)}>
      <div className="w-24 h-16 bg-muted rounded-md overflow-hidden shrink-0">
        {course.poster ? (
          <img src={course.poster} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            Sin imagen
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-medium text-sm line-clamp-2">
            <Link to={`/watch/${course.slug}`} onClick={() => setModalOpen?.(false)}>
              {course.title}
            </Link>
            </h4>
          <div className="mt-1">
            <Badge variant="secondary" className="font-normal">
              {formatShoppingCartItemDestination(destination)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm">{formatPrice(discountedPrice(course.price, course.discountPercent))}
              </span>
              {course.discountPercent > 0 && (
                <span className="text-xs text-muted-foreground line-through">{formatPrice(course.price)}</span>
              )}
            </div>

            <ButtonGroup>
              <Button 
                variant="outline" 
                size="icon-xs" 
                className="h-6 w-6" 
                onClick={handleDecrease}
                disabled={disableQuantityBtns || isCurrentUser || quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input 
                className="h-6 w-10 px-1 text-center text-xs" 
                value={quantity} 
                onChange={handleInputChange}
                disabled={disableQuantityBtns || isCurrentUser}
              />
              <Button 
                variant="outline" 
                size="icon-xs" 
                className="h-6 w-6" 
                onClick={handleIncrease}
                disabled={disableQuantityBtns || isCurrentUser}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </ButtonGroup>
          </div>
          
          {!hideDeleteBtn && (
            <Button 
              variant="ghost" 
              size="icon-xs" 
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => handleUpdateQuantity(-1)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
