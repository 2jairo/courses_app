import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckoutPhasePaymentTabNew } from "./checkoutPhasePaymentTabNew"
import { CheckoutPhasePaymentTabSaved } from "./checkoutPhasePaymentTabSaved"

interface CheckoutPhasePaymentParams {
  handlePrevPhase: () => void
  handleNextPhase: () => void
}

export const CheckoutPhasePayment = ({ handleNextPhase, handlePrevPhase }: CheckoutPhasePaymentParams) => {
  const [pmTab, setPmTab] = useState('saved')

  return (
    <Card className="flex-1 flex flex-col w-full bg-transparent">
      <CardHeader>
        <CardTitle>Método de pago</CardTitle>
        <CardDescription>Escoge cómo quieres finalizar tu compra.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <Tabs onValueChange={(v) => setPmTab(v)} value={pmTab} className="flex flex-1 gap-4">
          <TabsList className="w-full">
            <TabsTrigger value="new" className="w-full">
              Nuevo
            </TabsTrigger>
            <TabsTrigger value="saved" className="w-full">
              Guardados
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="new" className="flex flex-col flex-1">
            <CheckoutPhasePaymentTabNew handleNextPhase={handleNextPhase} handlePrevPhase={handlePrevPhase} />
          </TabsContent>
          
          <TabsContent value="saved" className="flex flex-col flex-1">
            <CheckoutPhasePaymentTabSaved handleNextPhase={handleNextPhase} handlePrevPhase={handlePrevPhase} handleChangePmTab={() => setPmTab('new')} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}


