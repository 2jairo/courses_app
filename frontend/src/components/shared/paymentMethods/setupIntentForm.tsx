import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useFinishSetupIntentMutation } from "@/mutations/client/paymentMethods/useFinishSetupIntentMutation"
import { toast } from "sonner"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ClientPaymentMethodsService } from "@/services/client/clientPaymentMethods.service"
import type { AxiosError } from "axios"
import type { LocalErrorResponse } from "@/types/error"
import { getErrorMessage } from "@/lib/formatError"
import { Spinner } from "@/components/ui/spinner"

export interface SetupIntentFormProps {
  onSuccess: () => void
}

export const SetupIntentForm = ({ onSuccess }: SetupIntentFormProps) => {
  const stripe = useStripe()
  const elements = useElements()

  const finishMutation = useFinishSetupIntentMutation()
  const [stripeLoading, setStripeLoading] = useState(false)
  const [isDefault, setIsDefault] = useState(true)
  const loading = !stripe || !elements || finishMutation.isLoading || stripeLoading

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

      const { clientSecret } = await ClientPaymentMethodsService.createSetupIntent({})
      const { error, setupIntent } = await stripe.confirmSetup({
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
  
      if (setupIntent) {
        finishMutation.mutate(
          { 
            setupIntentId: setupIntent.id,
            isDefault,
          },
          {
            onSuccess: () => {
              toast.success("Método de pago añadido exitosamente.")
              onSuccess()
            },
          }
        )
      }
    } catch (e) {
      const err = e as AxiosError<LocalErrorResponse>
      const errorMessage = err.response?.data 
        ? getErrorMessage(err.response.data) 
        : "Ocurrió un error inesperado al procesar la solicitud."
      toast.error(errorMessage)
    }
    
    setStripeLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement 
        options={{
          // Hide saved payment methods and Link
          wallets: {
            applePay: "never",
            googlePay: "never",
            link: "never",
          },
        }} 
      />

      <div className="flex items-center justify-between border rounded-md p-4">
        <div className="space-y-0.5">
          <Label htmlFor="isDefault">Método de pago principal</Label>
          <p className="text-sm text-muted-foreground text-balance">
            Establecer como el método por defecto para futuros cargos.
          </p>
        </div>
        <Switch
          id="isDefault"
          checked={isDefault}
          onCheckedChange={setIsDefault}
        />
      </div>
      
      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? <Spinner /> : "Guardar método de pago"}
      </Button>
    </form>
  )
}
