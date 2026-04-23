import { CheckoutDetails } from "@/components/shared/checkout/checkoutDetails";
import { setDocumentTitle } from "@/lib/documentTitle";
import { useEffect } from "react"

export default function CheckoutPage() {
  useEffect(() => {
    setDocumentTitle("Checkout", true)
  }, [])
  return (
    <div className="flex flex-1 mx-auto w-full max-w-350">
      <CheckoutDetails />
    </div>
  )
}