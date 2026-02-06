import { useEffect, useRef, useCallback } from "react"

interface UsePlayerControlsKeysProps {
  seek: (cb: (currentTime: number) => number) => void
  togglePause: () => void
  toggleFullscreen: () => void
  duration: number
  enabled?: boolean
  volume: number
  lastVolume: number
  setLastVolume: (volume: number) => void
  setVolume: (volume: number) => void
}

export const usePlayerControlsKeys = ({
  seek,
  togglePause,
  toggleFullscreen,
  duration,
  enabled = true,
  volume,
  lastVolume,
  setLastVolume,
  setVolume,
}: UsePlayerControlsKeysProps) => {
  const enabledRef = useRef(enabled)

  const handleToggleVolume = useCallback(() => {
    if (volume === 0) {
      setVolume(lastVolume === 0 ? 0.5 : lastVolume)
    } else {
      setLastVolume(volume)
      setVolume(0)
    }
  }, [volume, setVolume, lastVolume, setLastVolume])

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!enabledRef.current) return

      const target = e.target as HTMLElement
      if (!target || target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          seek((t) => t - 5)
          break
        case "ArrowRight":
          e.preventDefault()
          seek((t) => t + 5)
          break
        case "j":
        case "J":
          seek((t) => t - 10)
          break
        case "k":
        case "K":
          togglePause()
          break
        case "l":
        case "L":
          seek((t) => t + 10)
          break
        case "f":
        case "F":
          toggleFullscreen()
          break
        case " ":
          e.preventDefault()
          togglePause()
          break
        case "m":
          handleToggleVolume()
          break
        default:
          if (!isNaN(Number(e.key))) {
            const percent = Math.max(Math.min(Number(e.key) / 10, 1), 0)
            seek(() => duration * percent)
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeydown)
    return () => window.removeEventListener("keydown", handleKeydown)
  }, [seek, togglePause, toggleFullscreen, duration])
}
