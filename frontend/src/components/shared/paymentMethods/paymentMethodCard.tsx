import { Card, CardContent } from "@/components/ui/card"
import { MoreHorizontal, Star, Trash } from "lucide-react"
import { formatCardExpiry, formatCardFunding, formatPaymentMethodName } from "@/lib/format"
import type { PaymentMethodResponse } from "@/types/client/paymentMethods"
import { CardBrandIcon } from "./cardBrandIcon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useRemovePaymentMethodMutation } from "@/mutations/client/paymentMethods/useRemovePaymentMethodMutation"
import { useUpdatePaymentMethodMutation } from "@/mutations/client/paymentMethods/useUpdatePaymentMethodMutation"
import { toast } from "sonner"
import { useState } from "react"
import { cn } from "@/lib/utils"

export interface PaymentMethodCardProps {
  method: PaymentMethodResponse
  className?: string
  hideDropdownMenu?: boolean
  hideStars?: boolean
}

export const PaymentMethodCard = ({ method, className, hideDropdownMenu, hideStars }: PaymentMethodCardProps) => {
  const removeMutation = useRemovePaymentMethodMutation()
  const updateMutation = useUpdatePaymentMethodMutation()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleSetDefault = () => {
    updateMutation.mutate(
      { paymentMethodId: method.id, isDefault: true },
      {
        onSuccess: () => {
          toast.success("Método de pago marcado como principal")
        }
      }
    )
  }

  const handleRemove = () => {
    removeMutation.mutate(
      { paymentMethodId: method.id },
      {
        onSuccess: () => {
          toast.success("Método de pago eliminado")
        }
      }
    )
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-accent">
              <CardBrandIcon brand={method.cardBrand} className="h-8 w-8" />
            </div>

            <div className="flex flex-col">
              <span className="font-medium leading-none capitalize">
                {formatPaymentMethodName(method.methodType, method.cardBrand, method.bankName)}
              </span>
              {method.methodType === 'card' && method.cardFunding && method.cardFunding !== "unknown" && (
                <span className="text-xs text-muted-foreground mt-1 capitalize">
                  {formatCardFunding(method.cardFunding)}
                </span>
              )}
              {method.methodType !== 'card' && method.country && (
                <span className="text-xs text-muted-foreground mt-1">
                  {method.country}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!hideStars && method.isDefault && (
              <Badge>
                <Star className="w-3 h-3 mr-1 fill-current" />
                Principal
              </Badge>
            )}
            
            {!hideDropdownMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    disabled={method.isDefault || updateMutation.isLoading}
                    onClick={handleSetDefault}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Hacer principal
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    disabled={removeMutation.isLoading}
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar método
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          {method.methodType === 'card' ? (
            <>
              <p className="text-sm font-medium tracking-widest">
                **** **** **** {method.lastFour}
              </p>
              {method.expiryMonth && method.expiryYear && (
                <p className="text-xs text-muted-foreground">
                  Expira en {formatCardExpiry(method.expiryMonth, method.expiryYear)}
                </p>
              )}
            </>
          ) : method.methodType === 'paypal' ? (
            <>
              {method.email && (
                <p className="text-sm font-medium">
                  {method.email}
                </p>
              )}
            </>
          ) : (
            <>
              {method.lastFour && (
                <p className="text-sm font-medium tracking-widest">
                  **** **** **** {method.lastFour}
                </p>
              )}
              {method.accountType && (
                <p className="text-xs text-muted-foreground capitalize">
                  Cuenta: {method.accountType}
                </p>
              )}
              {method.bankCode && (
                <p className="text-xs text-muted-foreground">
                  Código: {method.bankCode}
                </p>
              )}
            </>
          )}
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar método de pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se desvinculará {method.methodType === 'card' ? `la tarjeta terminada en ${method.lastFour}` : `el método de pago ${method.email || method.bankName || method.lastFour || ''}`.trim()} de tu cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              variant="destructive"
              disabled={removeMutation.isLoading}
              onClick={() => handleRemove()}
            >
              {removeMutation.isLoading ? "Eliminando..." : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
