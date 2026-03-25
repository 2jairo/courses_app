import { useGetPaymentMethodsQuery } from "@/queries/client/paymentMethods/useGetPaymentMethodsQuery"
import { AddPaymentMethodDialog } from "./addPaymentMethodDialog"
import { CreditCard } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { PaymentMethodCard } from "./paymentMethodCard"
import { useEffect } from "react"
import { toast } from "sonner"
import { getStripe } from "@/lib/stripeInstance"
import { useNavigate } from "react-router-dom"

export const PaymentMethods = () => {
  const navigate = useNavigate()
  const paymentMethodsQuery = useGetPaymentMethodsQuery({})
  const paymentMethods = paymentMethodsQuery.data

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('redirect_status')
    const setupIntentClientSecret = params.get('setup_intent_client_secret')

    if(status === 'succeeded') {
      toast.success("Método de pago añadido exitosamente.")
    }
    else if (status === 'failed' && setupIntentClientSecret) {
      getStripe().then(async (stripe) => {
        if(!stripe) {
          
          // toast.error(error.message || "Error al procesar el método de pago.")
          toast.error("Error al procesar el método de pago.")
          return
        }

        const { error } = await stripe.retrieveSetupIntent(setupIntentClientSecret)
        toast.error(error?.message || "Error al procesar el método de pago.")
      })
    }

    navigate('?', { replace: true })
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <div>
          <h2 className="text-lg font-medium">Métodos de pago</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona tus tarjetas y métodos de pago guardados.
          </p>
        </div>
        <AddPaymentMethodDialog />
      </div>

      <div className="p-4">
        {paymentMethodsQuery.isLoading ? (
          <Spinner />
        ) : paymentMethods && paymentMethods.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paymentMethods.map((pm) => (
              <PaymentMethodCard key={pm.id} method={pm} />
            ))}
          </div>
        ) : (
          <Empty className="border">
            <EmptyMedia variant="icon">
              <CreditCard />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No hay métodos de pago</EmptyTitle>
              <EmptyDescription>Aún no has añadido ningún método de pago a tu cuenta.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  )
}
