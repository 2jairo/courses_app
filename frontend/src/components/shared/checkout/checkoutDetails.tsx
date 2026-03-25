import { useState } from "react"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { CheckoutPhaseCart } from "./checkoutPhaseCart"
import { CheckoutPhasePayment } from "./checkoutPhasePayment"

const PHASES = {
  cart: 1,
  payment: 2,
  result: 3
}

export const CheckoutDetails = () => {
  const [phase, setPhase] = useState(PHASES.cart)

  const handleChangePhase = (ph: number) => {
    if(phase >= ph) {
      setPhase(ph)
    }
  }

  return (
    <div className="p-4 flex-1 flex flex-col gap-6 mx-auto w-full max-w-250">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Completa tu compra</h1>
        
        <div className="flex items-center gap-2 mt-4 text-sm font-medium mb-2">
          <span onClick={() => handleChangePhase(PHASES.cart)} className={phase >= PHASES.cart ? "text-primary font-bold cursor-pointer" : "text-muted-foreground"}>1. Carrito</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span onClick={() => handleChangePhase(PHASES.payment)} className={phase >= PHASES.payment ? "text-primary font-bold cursor-pointer" : "text-muted-foreground"}>2. Pago</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span onClick={() => handleChangePhase(PHASES.result)} className={phase === PHASES.result ? "text-primary font-bold cursor-pointer" : "text-muted-foreground"}>3. Confirmación</span>
        </div>
      </div>

      {phase === PHASES.cart && <CheckoutPhaseCart handleNextPhase={() => setPhase(p => p +1)} />}
      {phase === PHASES.payment && <CheckoutPhasePayment handlePrevPhase={() => setPhase(p => p -1)} handleNextPhase={() => setPhase(p => p +1)} />}

      {phase === PHASES.result && (
        <Card className="flex flex-col w-full text-center items-center py-12 px-4 shadow-sm border-primary/20 bg-primary/5">
          <CheckCircle2 className="h-16 w-16 text-primary mb-6" />
          <CardTitle className="text-2xl mb-2">¡Pago exitoso!</CardTitle>
          <CardDescription className="text-base mb-8 max-w-sm">
            Tu compra se ha procesado correctamente. Ya puedes acceder a tus cursos.
          </CardDescription>
          <Button asChild size="lg">
            <Link to="/dashboard/mis-cursos">Ir a Mis Cursos</Link>
          </Button>
        </Card>
      )}
    </div>
  )
}
