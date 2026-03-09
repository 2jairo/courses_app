import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/format"

interface QuizTimerProps {
  expiresAt: string
  onExpire: () => void
}

export function QuizTimer({ expiresAt, onExpire }: QuizTimerProps) {
  const getRemainingSecs = () => {
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  }

  const [secs, setSecs] = useState(getRemainingSecs)

  useEffect(() => {
    const updateSecs = () => {
      const remaining = getRemainingSecs()
      setSecs(remaining)
      if (remaining <= 0) {
        clearInterval(id)
        onExpire()
      }
    }

    const id = setInterval(() => updateSecs(), 1000)
    updateSecs()

    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt])

  const isWarning = secs <= 60
  const isCritical = secs <= 30

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium rounded-md px-2.5 py-1",
        isCritical
          ? "text-destructive bg-destructive/10 animate-pulse"
          : isWarning
          ? "text-orange-500 bg-orange-500/10"
          : "text-muted-foreground bg-muted/50"
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      <span>{formatDuration(secs, true)}</span>
    </div>
  )
}
