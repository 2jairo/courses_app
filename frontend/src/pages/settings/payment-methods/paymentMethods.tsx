import { PaymentMethods } from "@/components/shared/paymentMethods/paymentMethods"
import { setDocumentTitle } from "@/lib/documentTitle"
import { useEffect } from "react"

export default function PaymentMethodsPage() {
  useEffect(() => {
    setDocumentTitle("Métodos de pago", true)
  }, [])
  return (
    <div className="mx-auto w-full max-w-350">
      <PaymentMethods />
    </div>
  )
}