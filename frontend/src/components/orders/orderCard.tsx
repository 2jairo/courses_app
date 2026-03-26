import { ShoppingBag, CreditCard, Package } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { formatDate, formatPrice, formatOrderStatus, formatPaymentStatus, formatPaymentProvider } from "@/lib/format"
import type { OrderResponse } from "@/types/client/orders"
import type { Currency } from "@/types/common/price"
import { PaymentMethodCard } from "../shared/paymentMethods/paymentMethodCard"
import { useEffect, useState } from "react"
import { ShoppingCartItem } from "../shared/shoppingCart/shoppingCartItem"
import { discountedPrice } from "@/lib/discountedPrice"
import { OrderItemDestinationGiftCodesDialog } from "./orderItemDestinationGiftCodesDialog"

interface OrderCardProps {
  order: OrderResponse
  collapseAccordions: boolean
}

export function OrderCard({ order, collapseAccordions }: OrderCardProps) {

  const [openAccordions, setOpenAccordions] = useState([] as string[])

  const toggleOpen = (value: string) => {
    if(openAccordions.includes(value)) {
      setOpenAccordions((prev) => [...prev.filter(v => v !== value)])
    } else {
      setOpenAccordions((prev) => [...prev, value])
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenAccordions(collapseAccordions ? ["items", "payments"] : [])
  }, [collapseAccordions])

  return (
    <Card className="flex flex-col gap-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex gap-4 items-center">
          <div className="size-10 bg-accent rounded flex items-center justify-center">
            <Package className="size-8" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-base font-medium">
              Pedido #{order.id}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <Badge variant={order.status === "Paid" ? "default" : order.status === "Cancelled" ? "destructive" : "secondary"}>
          {formatOrderStatus(order.status)}
        </Badge>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="text-2xl font-bold mb-4">
          {formatPrice(order.totalAmount, order.currency as Currency)}
        </div>

        <Accordion value={openAccordions} type="multiple"  className="w-full">
          <AccordionItem onClick={() => toggleOpen("items")} value="items" className="border-b-0">
            <AccordionTrigger className="py-2 hover:no-underline rounded-md px-2 -mx-2 hover:bg-muted/50 data-[state=open]:bg-muted/50">
              <div className="flex items-center text-sm font-medium">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Artículos ({order.items.length})
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-0" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="border border-border p-4 rounded-2xl flex gap-4">
                    <ShoppingCartItem
                      key={item.id} 
                      hideDeleteBtn disableQuantityBtns
                      className="flex-1 py-0"
                      item={{
                        course: {
                          ...item.course,
                          discountPercent: item.discountPercentPerUnit,
                          price: item.unitPrice,
                          currency: 'EUR',
                          isFree: discountedPrice(item.unitPrice, item.discountPercentPerUnit) <= 0
                        },
                        quantity: item.quantity,
                        destination: item.destination
                      }}
                    />

                    {item.destination === "Gift" && order.status === "Paid" && (
                      <OrderItemDestinationGiftCodesDialog orderId={order.id} item={item}/>
                    )}
                  </div>

                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {order.payments.length > 0 && (
            <AccordionItem value="payments" onClick={() => toggleOpen("payments")} className="border-b-0 mt-1">
              <AccordionTrigger className="py-2 hover:no-underline rounded-md px-2 -mx-2 hover:bg-muted/50 data-[state=open]:bg-muted/50">
                <div className="flex items-center text-sm font-medium">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pagos ({order.payments.length})
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-4">
                  {order.payments.map((payment, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-md bg-muted/20 border p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{formatPaymentProvider(payment.provider)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(payment.updatedAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatPrice(payment.amount, payment.currency as Currency)}</p>
                          <Badge variant={payment.status === "Succeeded" ? "default" : payment.status === "Failed" ? "destructive" : "secondary"} className="mt-1 text-[10px] h-4 py-0">
                            {formatPaymentStatus(payment.status)}
                          </Badge>
                        </div>
                      </div>
                      
                      {payment.refundedAmount > 0 && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Reembolsado:</span>
                          <span className="font-medium">{formatPrice(payment.refundedAmount, payment.currency as Currency)}</span>
                        </div>
                      )}

                      {payment.errorMessage && (
                        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-md mt-1">
                          {payment.errorMessage}
                        </div>
                      )}

                      {payment.paymentMethod && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Método de pago utilizado:</p>
                          <PaymentMethodCard 
                            method={payment.paymentMethod} 
                            hideDropdownMenu 
                            hideStars
                            className="bg-card shadow-sm border-muted"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  )
}