import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DialogDeleteProps {
  handleDelete: () => void
  isLoading: boolean
  trigger: "text" | "icon" | "both"
  entity: string
  children: React.ReactNode
}

export function DialogDelete({ entity, handleDelete, trigger, children, isLoading }: DialogDeleteProps) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant={trigger === 'icon' || trigger === 'text' ? 'destructive' : 'ghost'}
            size={trigger === 'both' ? 'sm' : 'xs'}
            disabled={isLoading}
            className={`
              ${trigger === 'icon' ? 'h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center' : ''}
              ${trigger === 'both' ? 'h-auto px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start gap-2' : ''}
            `}            
          >
            {trigger === 'icon' && <Trash2 className="h-4 w-4" /> }
            {trigger === 'text' && 'Eliminar'}
            {trigger === 'both' && (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Eliminar</span>
              </>
            )}
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {entity}?</AlertDialogTitle>
            <AlertDialogDescription>
              {children}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}