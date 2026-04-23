import { OrdersList } from "@/components/orders/orderList";
import { setDocumentTitle } from "@/lib/documentTitle";
import { useEffect } from "react"


export default function BillingPage() {
  useEffect(() => {
    setDocumentTitle("Facturación", true)		
  }, [])
  return (
    <div className="mx-auto w-full max-w-350">
      <OrdersList />
    </div>
  )
}