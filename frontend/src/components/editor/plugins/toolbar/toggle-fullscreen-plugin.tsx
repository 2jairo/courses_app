import { useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function ToggleFullscreen() {
  const [editor] = useLexicalComposerContext()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const getContainer = () => {
    return editor
      .getRootElement()
      ?.closest<HTMLElement>("[data-lexical-editor-container]")
  }

  useEffect(() => {
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const exitFullscreen = () => {
    const container = getContainer()
    if (!container) {
      return
    }
    container.style = ''
    document.body.style.overflow = ""
    setIsFullscreen(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen && e.key === "Escape") {
        exitFullscreen()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen])

  const enterFullscreen = (container: HTMLElement) => {
    container.style = 'position: fixed; inset: 0; z-index: 49; width: 100wh; height: 100vh; overflow: auto; border-radius: 0'
    document.body.style.overflow = "hidden"
    setIsFullscreen(true)
  }

  const toggle = () => {
    if (isFullscreen) {
      exitFullscreen()
      return
    } 

    const container = getContainer()
    if (!container) {
      toast.error(`No se pudo cambiar a pantalla completa`)
    } else {
      enterFullscreen(container)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          onClick={toggle}
        >
          {isFullscreen
            ? <Minimize2 className="size-4" />
            : <Maximize2 className="size-4" />
          }
        </Button>
      </TooltipTrigger>
      <TooltipContent className="z-999">
        {isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      </TooltipContent>
    </Tooltip>
  )
}