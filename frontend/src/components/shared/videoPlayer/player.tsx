import { useCallback, useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import { cn } from "@/lib/utils"
import type { DisabledControls, HlsWrapperStartControls } from "../../../lib/videoPlayer/types"
import type { VideoPlayerSubtitle } from "@/types/videoPlayer"
import { useHlsWrapper } from "../../../hooks/useHlsWrapper"
import { PlayerControls } from "./playerControls"
import { PlayerSubtitles } from "./PlayerSubtitles"
import { usePlayerControlsKeys } from "@/lib/videoPlayer/playerControlsKeys"

interface VideoPlayerProps {
  baseUrl: string
  videoSrc: string
  poster: string
  thumbnails: string
  subtitles: VideoPlayerSubtitle[]

  videoElmtId?: string
  minZindex?: number
  disabledControls?: DisabledControls[]
  disabledControlsAffectOnFullscreen?: boolean
  autoplay?: boolean
  startControls?: HlsWrapperStartControls
  collectHeatmap?: boolean
  className?: string
}

export const VideoPlayer = ({
  baseUrl,
  videoSrc,
  poster,
  thumbnails,
  subtitles,

  videoElmtId,
  minZindex = 900,
  disabledControls = [],
  disabledControlsAffectOnFullscreen,
  autoplay = true,
  startControls = {},
  className,
}: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const forceHideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [showControls, setShowControls] = useState(true)
  const [forceShowCtrls, setForceShowCtrls] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null)

  const videoSrcWithBase = `${baseUrl}/${videoSrc}`
  const posterWithBase = `${baseUrl}/${poster}`
  const thumbnailsWithBase = `${baseUrl}/${thumbnails}`
  const subtitlesWithBase = subtitles.map((s) => ({ ...s, path: `${baseUrl}/${s.path}` }))

  const {
    videoRef,
    hlsChanges,
    initHls,
    seek,
    togglePause,
    setLastVolume,
    setVolume,
    videoInteraction,
    ...rest
  } = useHlsWrapper({
    videoUrl: videoSrcWithBase,
    thumbnailsUrl: thumbnailsWithBase,
    subtitles: subtitlesWithBase,
    startControls,
  })

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (fullscreen) {
      document.exitFullscreen()
    } else {
      containerRef.current?.requestFullscreen()
    }
  }, [fullscreen])

  // Update fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(document.fullscreenElement !== null)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Hide cursor in fullscreen when controls are hidden
  useEffect(() => {
    if (!(showControls || forceShowCtrls) && fullscreen) {
      document.body.style.cursor = "none"
    } else {
      document.body.style.cursor = "default"
    }

    return () => {
      document.body.style.cursor = "default"
    }
  }, [showControls, forceShowCtrls, fullscreen])

  // Force show controls
  const forceShowControls = useCallback((show: boolean) => {
    if (forceHideControlsTimeoutRef.current) {
      clearTimeout(forceHideControlsTimeoutRef.current)
    }
    if (!show) {
      forceHideControlsTimeoutRef.current = setTimeout(() => {
        setForceShowCtrls(false)
      }, 2000)
    } else {
      setForceShowCtrls(true)
    }
  }, [])

  // Toggle show controls
  const toggleShowControls = useCallback((show: boolean) => {
    if (show) {
      setShowControls(true)
    }

    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 2000)
  }, [])

  // Initialize HLS
  const handleVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      if (el && videoRef.current !== el) {
        initHls(el)
        setVideoElement(el)
        toggleShowControls(false)
      }
    },
    [initHls, toggleShowControls, videoRef]
  )

  // Keyboard controls
  usePlayerControlsKeys({
    seek,
    togglePause,
    toggleFullscreen,
    setLastVolume,
    setVolume,
    lastVolume: videoInteraction.lastVolume,
    volume: videoInteraction.volume,
    duration: hlsChanges.duration,
  })

  if (!Hls.isSupported()) {
    return (
      <div className={cn("relative flex rounded-md overflow-hidden bg-black", className)}>
        <p className="text-white p-4">HLS no es compatible con tu navegador</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative flex rounded-md overflow-hidden", className)}
      onMouseMove={() => toggleShowControls(true)}
      onMouseLeave={() => toggleShowControls(false)}
    >
      <video
        ref={handleVideoRef}
        id={videoElmtId}
        autoPlay={autoplay}
        preload="auto"
        poster={posterWithBase}
        className="w-full h-full aspect-video"
      >
        <p>No compatible</p>
      </video>

      <div className={cn("absolute inset-0 transition-opacity duration-200")}>
        <div className={cn(showControls || forceShowCtrls ? "opacity-100" : "opacity-0")}>
          <PlayerControls
            fullscreen={fullscreen}
            toggleFullscreen={toggleFullscreen}
            disabledControls={disabledControls}
            disabledControlsAffectOnFullscreen={disabledControlsAffectOnFullscreen}
            forceShowControls={forceShowControls}
            hlsChanges={hlsChanges}
            videoElmt={videoElement}
            minZindex={minZindex}
            togglePause={togglePause}
            seek={seek}
            setLastVolume={setLastVolume}
            videoInteraction={videoInteraction}
            setVolume={setVolume}
            {...rest}
          />
        </div>

        <PlayerSubtitles
          subtitles={hlsChanges.subtitles}
          zIndex={minZindex}
          controlsOpen={showControls || forceShowCtrls}
        />
      </div>
    </div>
  )
}