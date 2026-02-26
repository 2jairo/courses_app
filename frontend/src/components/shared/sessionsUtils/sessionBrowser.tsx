import { Badge } from "@/components/ui/badge"
import { formatBrowser } from "@/lib/format"
import type { BrowserType } from "@/types/client/auth"
import type { ShadcnVariant } from "@/types/shadcnVariants"
import { Compass, Flame, Globe, Shield, Wind, type LucideProps } from "lucide-react"

interface SessionBrowserProps {
  browser: BrowserType
  variant: ShadcnVariant
}

export function SessionBrowserIcon({ browser, ...props }: { browser: BrowserType } & LucideProps) {
  switch (browser) {
    case "Chrome":          return <Globe {...props} />
    case "Safari":          return <Compass {...props} />
    case "Firefox":         return <Flame {...props} />
    case "Edge":            return <Wind {...props} />
    case "Brave":           return <Shield {...props} />
    case "Opera":           return <Globe {...props} />
    case "InternetExplorer": return <Globe {...props} />
    case "Other":           return <Globe {...props} />
  }
}

export function SessionBrowserBadge({ browser, variant }: SessionBrowserProps) {
  return (
    <Badge variant={variant} className="text-xs flex items-center gap-1">
      <SessionBrowserIcon browser={browser} className="w-3 h-3" />
      <span>{formatBrowser(browser)}</span>
    </Badge>
  )
}
