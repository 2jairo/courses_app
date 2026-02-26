import { Badge } from "@/components/ui/badge"

export function SessionCurrentBadge() {
  return (
    <Badge className="text-xs">
      Sesión actual
    </Badge>
  )
}

export function SessionOnlineBadge() {
  return (
    <Badge variant="outline" className="text-xs text-green-500 border-green-500 flex items-center gap-1">
      <span className="size-1.5 rounded-full bg-green-500 inline-block" />
      En línea
    </Badge>
  )
}
