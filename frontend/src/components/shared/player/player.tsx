import { useEffect, useRef, useState } from "react"
import { PlayerControls } from "./playerControls"
import * as hls from 'hls.js'

interface Props {
  videoElmtId?: string
  autoplay?: boolean
  poster?: string
  minZindex?: number
}

export const Player = ({
  videoElmtId = crypto.randomUUID(),
  autoplay = true,
  minZindex = 500,
  poster
}: Props) => {
  const [fullscreen, setFullscreen] = useState(document.fullscreenElement !== null)
  const controlsContainerElmt = useRef<HTMLDivElement | null>(null)
  const videoElmt = useRef<HTMLVideoElement | null>(null)

  console.log(hls)

  const updateFullScreen = () => {
    setFullscreen(document.documentElement !== null)
  }

  useEffect(() => {
    document.removeEventListener('fullscreenchange', updateFullScreen)

    return () => {
      document.addEventListener('fullscreenchange', updateFullScreen)
    }
  }, [])

  const toggleFullScreen = () => {
    if (fullscreen) {
      document.exitFullscreen()
    } else {
      controlsContainerElmt.current?.requestFullscreen()
    }
  }

  return (
    <div
      ref={controlsContainerElmt}
      className="relative flex overflow-hidden rounded-md"
    >
      <video
        id={videoElmtId}
        autoPlay={autoplay}
        preload="auto"
        poster={poster}
        ref={videoElmt}
        className="bg-black w-full h-full aspect-video"
      >
        <p>Not supported</p>
      </video>

      <div className="absolute inset-0">
        <PlayerControls
          fullscreen={fullscreen}
          toggleFullscreen={toggleFullScreen}
          videoElmt={videoElmt}
          minZindex={minZindex}
        />
      </div>
    </div>
  )
}