import { ShoppingCart as ShoppingCartIcon } from "lucide-react"

import { useGetShoppingCartQuery } from "@/queries/client/shoppingCart/useGetShoppingCartQuery"
import { useClearShoppingCartMutation } from "@/mutations/client/shoppingCart/useClearShoppingCartMutation"
import { 
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ShoppingCartItem } from "./shoppingCartItem"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatPrice } from "@/lib/format"
import { useContext, useState } from "react"
import { UserContext } from "@/context/user/createUserContext"
import { Link } from "react-router-dom"

export const ShoppingCartSheet = () => {
  const { user } = useContext(UserContext)
  const [modalOpen, setModalOpen] = useState(false)
  const { data: cartResponse, isLoading } = useGetShoppingCartQuery({ username: user?.username, payload: {} }, !!user)
  const clearShoppingCartMutation = useClearShoppingCartMutation()

  const isLoadingAll = isLoading || clearShoppingCartMutation.isLoading
  const items = cartResponse?.items || []

  const handleClear = () => {
    clearShoppingCartMutation.mutate(
      {},
      {
        onSuccess: () => {
          toast.success('Carrito vaciado correctamente')
        }
      }
    )
  }
  
  const totalItemsCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <Sheet open={modalOpen} onOpenChange={setModalOpen}>
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <ShoppingCartIcon />
              {totalItemsCount > 0 && (
                <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full z-49 bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium animate-in zoom-in group-active:scale-90 transition-all">
                  {totalItemsCount > 99 ? '99+' : totalItemsCount}
                </div>
              )}
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>Carrito</TooltipContent>
      </Tooltip>

      <SheetContent side="right" className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Carrito de compras ({items.length})</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-4 -mx-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              Cargando carrito...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center mt-10">
              <ShoppingCartIcon className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground">Tu carrito está vacío.</p>
            </div>
          ) : (
            <div className="flex flex-col px-4 divide-y">
              {items.map((item) => (
                <ShoppingCartItem 
                  key={`${item.course.id}${item.destination}`} 
                  item={item} 
                  setModalOpen={setModalOpen}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && !!cartResponse && (
          <SheetFooter className="mt-auto border-t pt-4 block">
            <div className="flex items-center justify-between mb-4 w-full">
              <p className="font-semibold">Total</p>
              <p className="font-bold text-lg flex gap-2 items-center">
                <span className="text-xs text-muted-foreground line-through">{formatPrice(cartResponse.total, cartResponse.currency)}</span>
                <span>{formatPrice(cartResponse.totalDiscounted, cartResponse.currency)}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Link to={isLoadingAll ? '#' : "/checkout"}>
                <Button className="w-full" disabled={isLoadingAll} onClick={() => setModalOpen(false)}>Pasar por caja</Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full" disabled={isLoadingAll}>
                    Vaciar carrito
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Vaciar carrito?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará todos los cursos de tu carrito.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClear} variant="destructive">
                      Vaciar carrito
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
