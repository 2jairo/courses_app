import { Badge } from "@/components/ui/badge"
import { formatDeviceType } from "@/lib/format"
import type { DeviceType } from "@/types/client/auth"
import type { ShadcnVariant } from "@/types/shadcnVariants"
import { HelpCircle, Monitor, Smartphone, Tablet, Tv, type LucideProps } from "lucide-react"

interface SessionDeviceProps {
  device: DeviceType
  variant: ShadcnVariant
}

export function SessionDeviceIcon({ device, ...props }: { device: DeviceType } & LucideProps) {
  switch (device) {
    case "Desktop":  return <Monitor {...props} />
    case "Mobile":   return <Smartphone {...props} />
    case "Tablet":   return <Tablet {...props} />
    case "SmartTv":  return <Tv {...props} />
    case "Other":    return <HelpCircle {...props} />
  }
}

export function SessionDeviceBadge({ device, variant }: SessionDeviceProps) {
  return (
    <Badge variant={variant} className="text-xs flex items-center gap-1">
      <SessionDeviceIcon device={device} className="w-3 h-3" />
      <span>{formatDeviceType(device)}</span>
    </Badge>
  )
}
