import type { RefObject } from "react"

interface Props {
  fullscreen: boolean
  toggleFullscreen: () => void
  videoElmt: RefObject<HTMLVideoElement | null>
  minZindex: number
}

export const PlayerControls = ({ toggleFullscreen, minZindex }: Props) => {
  return (
    <main className="overflow-hidden absolute inset-0 flex flex-col select-none">
      <div className="flex-1" onDoubleClick={toggleFullscreen}></div>

      <div className={`p-2 z-[${minZindex + 1}]`} onClick={(e) => e.stopPropagation()}>

      </div>


    </main>
  )
}