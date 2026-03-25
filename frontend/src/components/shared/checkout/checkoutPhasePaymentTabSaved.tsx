import { useState } from "react"
import { PaymentMethodCard } from "@/components/shared/paymentMethods/paymentMethodCard"
import { CreditCard, Loader2 } from "lucide-react"
import { useGetPaymentMethodsQuery } from "@/queries/client/paymentMethods/useGetPaymentMethodsQuery"
import { useCreatePaymentIntentMutation } from "@/mutations/client/payments/useCreatePaymentIntentMutation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getStripe } from "@/lib/stripeInstance"

interface CheckoutPhasePaymentTabSavedProps {
  handlePrevPhase: () => void
  handleNextPhase: () => void
}

export const CheckoutPhasePaymentTabSaved = ({ handleNextPhase, handlePrevPhase }: CheckoutPhasePaymentTabSavedProps) => {
  const paymentMethodsQuery = useGetPaymentMethodsQuery({})
  const createPaymentIntent = useCreatePaymentIntentMutation()
  
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("")

  const handlePayment = () => {
    if (!selectedPaymentMethodId) {
      toast.error("Por favor, selecciona un método de pago.")
      return
    }
    
    createPaymentIntent.mutate(
      { paymentMethodId: selectedPaymentMethodId, savePaymentMethod: false },
      {
        onSuccess: (resp) => {
          if(resp.status !== 'requires_action') {
            handleNextPhase()
            return
          }

          getStripe()
            .then(async (stripe) => {
              if(!stripe) {
                throw new Error("Error al procesar el método de pago")
              }

              const { error } = await stripe.confirmCardPayment(resp.clientSecret)
              if(error) {
                toast.error(error.message || "Error al procesar el método de pago.")
                return
              }
              
              handleNextPhase()
            })
            .catch((e) => {
              toast.error(e instanceof Error ? e.message : "Error al procesar el método de pago.")
            })
        }
      }
    )
  }

  return (
    <>
      <div className="pt-2 flex-1">
        {paymentMethodsQuery.isLoading ? (
          <div className="py-8 flex justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : paymentMethodsQuery.data && paymentMethodsQuery.data.length > 0 ? (
          <div className="grid gap-3">
            {paymentMethodsQuery.data.map((method) => (
              <div key={method.id} onClick={() => setSelectedPaymentMethodId(method.token)}>
                <PaymentMethodCard 
                  hideDropdownMenu
                  method={method}
                  className={cn(
                    `cursor-pointer transition-all`,
                    selectedPaymentMethodId === method.token ? "border-2 border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  )}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground flex flex-col items-center gap-2">
            <CreditCard className="h-8 w-8 opacity-50" />
            <p>No tienes métodos de pago guardados.</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={handlePrevPhase} className="flex-1">
          Volver
        </Button>
        <Button 
          onClick={handlePayment} 
          disabled={!selectedPaymentMethodId || createPaymentIntent.isLoading} 
          className="flex-1"
        >
          {createPaymentIntent.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pagar
        </Button>
      </div>
    </>
  )
}
