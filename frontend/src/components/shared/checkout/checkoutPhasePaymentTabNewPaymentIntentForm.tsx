import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { AxiosError } from "axios"
import type { LocalErrorResponse } from "@/types/error"
import { getErrorMessage } from "@/lib/formatError"
import { Spinner } from "@/components/ui/spinner"
import { ClientPaymentsService } from "@/services/client/clientPayments.service"

export interface PaymentIntentFormProps {
  handlePrevPhase: () => void
  handleNextPhase: () => void
  savePm: boolean
  setSavePm: (val: boolean) => void
}

export const PaymentIntentForm = ({ handleNextPhase, handlePrevPhase, savePm, setSavePm }: PaymentIntentFormProps) => {
  const stripe = useStripe()
  const elements = useElements()

  const [stripeLoading, setStripeLoading] = useState(false)
  const loading = !stripe || !elements || stripeLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) {
      return
    }

    setStripeLoading(true)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        toast.error(submitError.message || "Error al validar la información.")
        setStripeLoading(false)
        return
      }

      const { clientSecret } = await ClientPaymentsService.createPaymentIntent({
        savePaymentMethod: savePm
      })

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: window.location.href
        },
        clientSecret
      })
  
      if (error) {
        toast.error(error.message || "Error al procesar el método de pago.")
        setStripeLoading(false)
        return
      }
  
      if (paymentIntent) {
        toast.success("Pago completado exitosamente.")
        handleNextPhase()
      }
    } catch (e) {
      const err = e as AxiosError<LocalErrorResponse>
      const errorMessage = err.response?.data 
        ? getErrorMessage(err.response.data) 
        : "Ocurrió un error inesperado al procesar la solicitud."
      toast.error(errorMessage)
      setStripeLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 space-y-4">
      <div className="flex items-center justify-between border rounded-md p-4">
        <div className="space-y-0.5">
          <Label htmlFor="isDefault">Guardar para próximos pagos</Label>
          <p className="text-sm text-muted-foreground text-balance">
            Guardar el método de pago para futuros cargos.
          </p>
        </div>
        <Switch
          id="isDefault"
          checked={savePm}
          onCheckedChange={setSavePm}
        />
      </div>

      <PaymentElement 
        className="flex-1"
        options={{
          // // Hide saved payment methods and Link
          wallets: {
            applePay: "never",
            googlePay: "never",
            link: "never",
          },
        }} 
      />


      <div className="flex gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handlePrevPhase} 
          className="flex-1"
          disabled={loading}
        >
          Volver
        </Button>
        <Button 
          type="submit" 
          disabled={loading} 
          className="flex-1"
        >
          {stripeLoading && <Spinner className="mr-2 h-4 w-4" />}
          Pagar
        </Button>
      </div>
    </form>
  )
}
