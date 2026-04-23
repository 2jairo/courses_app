
import { useState } from "react"
import { Loader2, Receipt, ChevronDown, ChevronUp } from "lucide-react"

import { useOrdersQuery } from "@/queries/client/orders/useOrdersQuery"
import { OrderCard } from "./orderCard"
import { Button } from "../ui/button"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"

export const OrdersList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useOrdersQuery()
  
  const [collapseAcordions, setCollapseAcordions] = useState(false)
  const observerTarget = useInfiniteScroll({ fetchNextPage, isFetchingNextPage, hasNextPage })

  const orders = data?.pages.flatMap((page) => page) ?? []

  if (status === "loading") {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }


  return (
    <div className="w-full mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between p-4">
        <div>
          <h2 className="text-lg font-medium">Pagos</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona tus ordenes
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCollapseAcordions(!collapseAcordions)}
        >
          {collapseAcordions ? <>
            <ChevronUp className="mr-2 h-4 w-4" />
            Contraer
          </> : <>
            <ChevronDown className="mr-2 h-4 w-4" />
            Expandir
          </>}
        </Button>
      </div>


      {orders.length === 0 && !isFetchingNextPage ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Sin pedidos</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Aún no has realizado ninguna compra.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} collapseAccordions={collapseAcordions} />
          ))}
        </div>
      )}

      {/* Intersection observer target for infinite scroll */}
      <div ref={observerTarget} className="h-2" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}