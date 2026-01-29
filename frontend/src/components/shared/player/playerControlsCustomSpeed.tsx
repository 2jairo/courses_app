import { useCallback, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

interface PlayerControlsCustomSpeedProps {
  speed: number
  setSpeed: (speed: number) => number
}

export const PlayerControlsCustomSpeed = ({ speed, setSpeed }: PlayerControlsCustomSpeedProps) => {
  const [keepInputValue, setKeepInputValue] = useState(false)
  const [inputValue, setInputValue] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.currentTarget.value) return

      const s = parseFloat(e.currentTarget.value)
      if (!isNaN(s)) {
        setKeepInputValue(true)
        const newSpeed = setSpeed(s)
        setInputValue(newSpeed)
      }
    },
    [setSpeed]
  )

  const handleSliderChange = useCallback(
    (value: number[]) => {
      setKeepInputValue(false)
      const s = (value[0] / 100) * 4
      setSpeed(s)
    },
    [setSpeed]
  )

  const speedPercent = (speed / 4) * 100

  return (
    <div className="flex flex-col items-center gap-3 w-full p-2">
      <Input
        type="number"
        value={keepInputValue ? inputValue : speed.toFixed(2)}
        onChange={handleInput}
        className="w-full h-8 text-center bg-background/50"
        step={0.1}
        min={0.25}
        max={4}
      />

      <div ref={sliderRef} className="w-full">
        <Slider
          value={[speedPercent]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleSliderChange}
          className="cursor-pointer **:data-[slot=slider-track]:h-1.5 **:data-[slot=slider-thumb]:size-3"
        />
      </div>
    </div>
  )
}
