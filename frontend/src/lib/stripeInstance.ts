import { loadStripe } from '@stripe/stripe-js'

export const getStripe = () => {
  return loadStripe(import.meta.env.VITE_STRIPE_API_PK);
}