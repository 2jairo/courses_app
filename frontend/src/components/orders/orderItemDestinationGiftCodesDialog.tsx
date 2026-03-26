import { useState } from "react"
import type { OrderItemResponse } from "@/types/client/orders"
import { useGetCourseGiftCodesQuery } from "@/queries/client/courseGiftCodes/useGetCourseGiftCodesQuery"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "../ui/badge"
import { formatDate } from "@/lib/format"
import { UserAvatar } from "../shared/userAvatar/userAvatar"
import { Copy } from "lucide-react"
import { toast } from "sonner"

interface OrderItemDestinationGiftCodesDialogProps {
  item: OrderItemResponse
  orderId: number
}

export const OrderItemDestinationGiftCodesDialog = ({ item, orderId }: OrderItemDestinationGiftCodesDialogProps) => {
  const [open, setOpen] = useState(false)

  const { data: giftCodes, isLoading } = useGetCourseGiftCodesQuery(
    {
      orderId: orderId,
      courseId: item.course.id,
    },
    open
  )

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success( "Código copiado al portapapeles")
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Mostrar códigos</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Códigos de regalo</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : giftCodes && giftCodes.length > 0 ? (
            <ul className="space-y-2">
              {giftCodes.map((code) => (
                <li key={code.code} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex flex-col">
                    <code className="font-mono text-sm font-semibold">{code.code}</code>
                    {code.redeemedAt && code.redeemedBy && (
                      <div className="flex gap-2 pt-2 items-center">
                        <UserAvatar className="size-8" avatar={code.redeemedBy?.avatar} username={code.redeemedBy?.username} />

                        <p className="text-xs text-muted-foreground">
                          Canjeado por {code.redeemedBy.username} el {formatDate(code.redeemedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyCode(code.code)}
                    >
                      <Copy className="size-4" />
                    </Button>
                    {code.redeemedAt ? (
                      <Badge variant="secondary">Canjeado</Badge>
                    ) : (
                      <Badge>Disponible</Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No hay códigos disponibles</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}