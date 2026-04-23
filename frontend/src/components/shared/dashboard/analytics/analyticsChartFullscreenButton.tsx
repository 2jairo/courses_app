import { useEffect, useRef, useState } from "react"
import { Maximize2, Minimize2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export const AnalyticsChartFullscreenButton = () => {
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      const card = triggerRef.current?.closest<HTMLElement>("[data-slot='card']")
      setIsFullscreen(Boolean(card && document.fullscreenElement === card))
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    handleFullscreenChange()

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const onToggleFullscreen = async () => {
    const card = triggerRef.current?.closest<HTMLElement>("[data-slot='card']")
    if (!card) return

    if (document.fullscreenElement === card) {
      await document.exitFullscreen()
      return
    }

    await card.requestFullscreen()
  }

  return (
    <Button
      ref={triggerRef}
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={() => void onToggleFullscreen()}
      title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
    >
      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
    </Button>
  )
}