
import { useState } from "react"
import { useRedeemGiftCodeMutation } from "@/mutations/client/courseGiftCodes/useRedeemGiftCodeMutation"
import type { RedeemGiftCodeResponse } from "@/types/client/courseGiftCodes"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"

interface ReddeemCourseGiftCodeDialogProps {
  trigger?: (setIsOpen: () => void) => React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
} 

export const ReddeemCourseGiftCodeDialog = ({ trigger, open: controlledOpen, onOpenChange }: ReddeemCourseGiftCodeDialogProps) => {
  const navigate = useNavigate()
  const [internalOpen, setInternalOpen] = useState(false)
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (value: boolean) => {
    if (controlledOpen !== undefined) {
      onOpenChange?.(value)
    } else {
      setInternalOpen(value)
    }
  }
  const [code, setCode] = useState("")
  const [successData, setSuccessData] = useState<RedeemGiftCodeResponse | null>(null)
  const redeemGiftCodeMutation = useRedeemGiftCodeMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    redeemGiftCodeMutation.mutate(
      { code: code.trim() },
      {
        onSuccess: (data) => {
          setSuccessData(data)
        },
      }
    )
  }


  const handleClose = () => {
    setCode("")
    setSuccessData(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger(() => setOpen(true))}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {successData ? "¡Código canjeado exitosamente!" : "Canjear código de regalo"}
          </DialogTitle>
        </DialogHeader>

        {successData ? (
          <div className="space-y-4">
            <div className="w-full h-40 bg-muted rounded-md overflow-hidden shrink-0">
              {successData.course.poster ? (
                <img src={successData.course.poster} alt={successData.course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Link to={`/watch/${successData.course.slug}`} onClick={() => setOpen(false)}>
                <h3 className="font-semibold text-lg">{successData.course.title}</h3>
              </Link>
              <p className="text-sm text-muted-foreground">
                Ya tienes acceso a este curso. ¡Comienza a aprender ahora!
              </p>
            </div>

            <Button className="w-full" onClick={() => {navigate(`/watch/${successData.course.slug}`); setOpen(false)}}>
              Ver curso
            </Button>

            <Button variant="secondary" onClick={handleClose} className="w-full">
              Canjear otro
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gift-code">Código de regalo</Label>
              <Input
                id="gift-code"
                placeholder="Ingresa tu código"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={redeemGiftCodeMutation.isLoading}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={redeemGiftCodeMutation.isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={redeemGiftCodeMutation.isLoading || !code.trim()}>
                {redeemGiftCodeMutation.isLoading ? "Canjeando..." : "Canjear"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}