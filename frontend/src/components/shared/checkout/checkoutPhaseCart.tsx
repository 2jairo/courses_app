import { ShoppingCartItem } from "../shoppingCart/shoppingCartItem"
import { formatPrice } from "@/lib/format"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useGetShoppingCartQuery } from "@/queries/client/shoppingCart/useGetShoppingCartQuery"
import { UserContext } from "@/context/user/createUserContext"
import { useContext } from "react"

interface CheckoutPhaseCartParams {
  handleNextPhase: () => void
}

export const CheckoutPhaseCart = ({ handleNextPhase }: CheckoutPhaseCartParams) => {
  const { user } = useContext(UserContext)
  const cartQuery = useGetShoppingCartQuery({ username: user?.username, payload: {} }, !!user)
  const items = cartQuery.data?.items || []
  
  return (
    <Card className="flex flex-1 flex-col w-full gap-0 bg-transparent">
      <CardHeader>
        <CardTitle>Detalles de compra</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {cartQuery.isLoading ? (
          <div className="py-8 flex justify-center text-muted-foreground w-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground w-full">Tu carrito está vacío.</div>
          //TODO: ADD BUTTON TO BROWSE COURSES
        ) : (
          <div className="flex flex-col gap-1 divide-y">
            {items.map((item) => (
              <ShoppingCartItem 
                key={`${item.course.id}${item.destination}`} 
                item={item} 
              />
            ))}
          </div>
        )}
      </CardContent>

      {items.length > 0 && cartQuery.data && (
        <CardFooter className="flex flex-col items-stretch gap-4 border-t pt-6 mt-2">
          <div className="flex w-full justify-between items-center bg-muted/50 p-4 rounded-lg">
            <p className="text-lg font-bold">Total a pagar:</p>

            <p className="font-bold text-xl flex gap-2 items-center">
              {cartQuery.data.total > cartQuery.data.totalDiscounted && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(cartQuery.data.total, cartQuery.data.currency)}
                </span>
              )}
              <span className="text-primary">
                {formatPrice(cartQuery.data.totalDiscounted, cartQuery.data.currency)}
              </span>
            </p>
          </div>
          <Button onClick={handleNextPhase} size="lg" className="w-full mt-2">
            Continuar al pago
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}