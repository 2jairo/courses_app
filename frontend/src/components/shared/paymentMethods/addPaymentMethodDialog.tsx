import { useContext, useEffect, useState } from "react"
import { Elements } from "@stripe/react-stripe-js"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SetupIntentForm } from "./setupIntentForm"
import { getStripe } from "@/lib/stripeInstance"
import type { Appearance, Stripe } from "@stripe/stripe-js"
import { ThemeProviderContext } from "@/context/theme/createThemeProvider"
import { Spinner } from "@/components/ui/spinner"

export const AddPaymentMethodDialog = () => {
  const { theme, lightOrDark } = useContext(ThemeProviderContext)
  const [open, setOpen] = useState(false)

  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)
  const [isStripeLoading, setIsStripeLoading] = useState(true)

  useEffect(() => {
    const promise = getStripe().finally(() => {
      setIsStripeLoading(false)
    })
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStripePromise(promise)
  }, [])

  const appearance: Appearance = {
    theme: lightOrDark(theme) === 'dark' ? 'night' : 'flat'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Añadir método de pago</Button>
      </DialogTrigger>
      
      <DialogContent className="max-h-[90vh] overflow-y-auto" onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Añadir método de pago</DialogTitle>
          <DialogDescription>
            Ingresa los detalles de tu tarjeta para añadir un nuevo método de pago.
          </DialogDescription>
        </DialogHeader>

        {isStripeLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner className="size-8" />
          </div>
        ) : stripePromise && (
          <Elements
            stripe={stripePromise}
            options={{
              mode: 'setup',
              currency: 'eur',
              appearance: appearance
            }}
          >
            <SetupIntentForm onSuccess={() => setOpen(false)} />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  )
}

