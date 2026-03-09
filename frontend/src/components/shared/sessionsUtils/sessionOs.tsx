import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatOs } from "@/lib/format"
import type { OperatingSystem } from "@/types/client/auth"
import type { ShadcnVariant } from "@/types/shadcnVariants"
import { Apple, Globe, Laptop, Monitor, Smartphone, Terminal, type LucideProps } from "lucide-react"

interface SessionOsProps {
  os: OperatingSystem
  variant: ShadcnVariant
}

export function SessionOsIcon({ os, ...props }: { os: OperatingSystem } & LucideProps) {
  switch (os) {
    case "Windows":   return <Monitor {...props} />
    case "MacOS":     return <Laptop {...props} />
    case "IOS":       return <Apple {...props} />
    case "Android":   return <Smartphone {...props} />
    case "Linux":     return <Terminal {...props} />
    case "ChromeOS":  return <Globe {...props} />
    case "Other":     return <Monitor {...props} />
  }
}

export function SessionOsBadge({ os, variant }: SessionOsProps) {
  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Badge variant={variant} className="text-xs flex items-center gap-1">
          <SessionOsIcon os={os} className="w-3 h-3" />
          <span>{formatOs(os)}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="z-999">
        Sistema operativo
      </TooltipContent>
    </Tooltip>
  )
}
