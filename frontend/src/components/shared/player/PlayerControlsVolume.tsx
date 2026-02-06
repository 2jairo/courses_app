import { useCallback, useRef, useState } from "react"
import { Volume2, VolumeX, Volume1 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

interface PlayerControlsVolumeProps {
  volume: number
  lastVolume: number
  setLastVolume: (volume: number) => void
  setVolume: (volume: number) => void
}

export const PlayerControlsVolume = ({ volume, lastVolume, setVolume, setLastVolume }: PlayerControlsVolumeProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleToggleVolume = useCallback(() => {
    if (volume === 0) {
      setVolume(lastVolume === 0 ? 0.5 : lastVolume)
    } else {
      setLastVolume(volume)
      setVolume(0)
    }
  }, [volume, setVolume, lastVolume, setLastVolume])

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      if (!isDragging) {
        setIsHovered(false)
      }
    }, 1000)
  }, [isDragging])

  const handleValueChange = useCallback(
    (value: number[]) => {
      setVolume(value[0] / 100)
    },
    [setVolume]
  )

  const handleValueCommit = useCallback(() => {
    setIsDragging(false)
    timeoutRef.current = setTimeout(() => setIsHovered(false), 1000)
  }, [])

  const VolumeIcon = volume === 0 ? VolumeX : volume > 0.5 ? Volume2 : Volume1

  return (
    <div
      className="flex items-center gap-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleToggleVolume}
        className="p-1.5 rounded-lg bg-background/30 transition-colors cursor-pointer"
      >
        <VolumeIcon className="size-5" />
      </button>

      <div
        className={cn(
          "transition-all duration-150 overflow-hidden",
          isHovered || isDragging ? "w-30 opacity-100" : "w-0 opacity-0"
        )}
      >
        <Slider
          value={[volume * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleValueChange}
          onValueCommit={handleValueCommit}
          onPointerDown={() => setIsDragging(true)}
          className="cursor-pointer"
        />
      </div>
    </div>
  )
}
