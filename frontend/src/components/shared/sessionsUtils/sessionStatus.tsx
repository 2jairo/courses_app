import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function SessionCurrentBadge() {
  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Badge className="text-xs">
          Sesión actual
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="z-999">
        Esta es tu sesión activa
      </TooltipContent>
    </Tooltip>
  )
}

export function SessionOnlineBadge() {
  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="text-xs text-green-500 border-green-500 flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-green-500 inline-block" />
          En línea
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="z-999">
        Sesión en línea
      </TooltipContent>
    </Tooltip>
  )
}
