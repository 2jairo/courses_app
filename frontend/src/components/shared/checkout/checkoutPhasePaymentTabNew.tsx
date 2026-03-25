import { useContext, useEffect, useState } from "react"
import { Elements } from "@stripe/react-stripe-js"
import { getStripe } from "@/lib/stripeInstance"
import type { Appearance, Stripe } from "@stripe/stripe-js"
import { ThemeProviderContext } from "@/context/theme/createThemeProvider"
import { Spinner } from "@/components/ui/spinner"
import { PaymentIntentForm } from "./checkoutPhasePaymentTabNewPaymentIntentForm"
import { UserContext } from "@/context/user/createUserContext"
import { useGetShoppingCartQuery } from "@/queries/client/shoppingCart/useGetShoppingCartQuery"

interface CheckoutPhasePaymentTabNewProps {
  handlePrevPhase: () => void
  handleNextPhase: () => void
}

export const CheckoutPhasePaymentTabNew = ({ handlePrevPhase, handleNextPhase }: CheckoutPhasePaymentTabNewProps) => {
  const { theme, lightOrDark } = useContext(ThemeProviderContext)
  const { user } = useContext(UserContext)
  const cartQuery = useGetShoppingCartQuery({ username: user?.username, payload: {} }, !!user)

  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)
  const [isStripeLoading, setIsStripeLoading] = useState(true)
  const [savePm, setSavePm] = useState(true)
  
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
    <>
      {isStripeLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner className="size-8" />
        </div>
      ) : stripePromise && cartQuery.data && (
        <Elements
          stripe={stripePromise}
          options={{
            mode: 'payment',
            amount: cartQuery.data.totalDiscounted,
            currency: cartQuery.data.currency.toLowerCase(),
            appearance: appearance,
            setupFutureUsage: savePm ? 'off_session' : undefined
          }}
        >
          <PaymentIntentForm 
            handlePrevPhase={handlePrevPhase} 
            handleNextPhase={handleNextPhase} 
            savePm={savePm} 
            setSavePm={setSavePm} 
          />
        </Elements>
      )}
    </>
  )
}

