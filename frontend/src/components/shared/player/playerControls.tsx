import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
  Settings,
  Space,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/format"
import type { DisabledControls, HlsChanges, VideoInteraction } from "../../../lib/videoPlayer/types"
import { PlayerControlsVolume } from "./PlayerControlsVolume"
import { PlayerControlsSettings } from "./PlayerControlsSettings"
import { PlayerThumbnailCurrent } from "./PlayerThumbnailCurrent"
import { PlayerThumbnailsCenter } from "./PlayerThumbnailsCenter"
import type { VideoPlayerSubtitle } from "@/types/videoPlayer"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Kbd } from "@/components/ui/kbd"

interface PlayerControlsProps {
  hlsChanges: HlsChanges
  videoInteraction: VideoInteraction
  videoElmt: HTMLVideoElement | null
  minZindex: number
  forceShowControls: (show: boolean) => void
  disabledControls: DisabledControls[]
  fullscreen: boolean
  toggleFullscreen: () => void
  togglePause: () => void
  setCurrentTime: (time: number) => void
  setVolume: (volume: number) => void
  setLastVolume: (volume: number) => void
  loadLevel: (level: number) => void
  setSpeed: (speed: number) => number
  setSubtitleLanguage: (subtitle: VideoPlayerSubtitle | null) => void
  seek: (cb: (currentTime: number) => number) => void
}

export const PlayerControls = ({
  hlsChanges,
  videoInteraction,
  videoElmt,
  minZindex,
  forceShowControls,
  disabledControls,
  fullscreen,
  toggleFullscreen,
  togglePause,
  setCurrentTime,
  setVolume,
  setLastVolume,
  loadLevel,
  setSpeed,
  seek,
  setSubtitleLanguage,
}: PlayerControlsProps) => {
  const [showSettings, setShowSettings] = useState(false)
  const [changeDurationFormat, setChangeDurationFormat] = useState(false)

  // Progress bar state
  const pgBarRef = useRef<HTMLDivElement>(null)
  const [pgBarElmt, setPgBarElmt] = useState<HTMLDivElement | null>(null)
  const [pgBarMouseDown, setPgBarMouseDown] = useState(false)
  const [pgBarWasVideoPaused, setPgBarWasVideoPaused] = useState(false)
  const [pgBarShowThumbnails, setPgBarShowThumbnails] = useState(false)
  const [pgBarThumbnailTime, setPgBarThumbnailTime] = useState(0)
  const [pgBarPercent, setPgBarPercent] = useState(-1)
  const [pgBarHoverX, setPgBarHoverX] = useState(-1)
  const [pgBarDistanceY, setPgBarDistanceY] = useState(0)
  const [pgBarShowThumbnailsCenter, setPgBarShowThumbnailsCenter] = useState(false)
  const pgBarShowThumbnailsCenterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Refs to hold latest values for event handlers
  const pgBarPercentRef = useRef(pgBarPercent)
  const pgBarWasVideoPausedRef = useRef(pgBarWasVideoPaused)
  
  useEffect(() => {
    pgBarPercentRef.current = pgBarPercent
  }, [pgBarPercent])
  
  useEffect(() => {
    pgBarWasVideoPausedRef.current = pgBarWasVideoPaused
  }, [pgBarWasVideoPaused])

  const pBarPercent = pgBarPercent >= 0 ? pgBarPercent : hlsChanges.videoTimePercent

  const pBarThumbnailIdx = useMemo(() => {
    const idx = hlsChanges.thumbnails.findIndex(
      (s) => s.start <= pgBarThumbnailTime && s.end >= pgBarThumbnailTime
    )

    if (idx === -1 && hlsChanges.thumbnails.length) {
      // Get nearest
      return hlsChanges.thumbnails.reduce((closestIdx, s, i) => {
        const currentDist = Math.abs(pgBarThumbnailTime - s.start)
        const closestDist = Math.abs(pgBarThumbnailTime - hlsChanges.thumbnails[closestIdx].start)
        return currentDist < closestDist ? i : closestIdx
      }, 0)
    }

    return idx
  }, [hlsChanges.thumbnails, pgBarThumbnailTime])

  // Force show controls when interacting
  useEffect(() => {
    forceShowControls(pgBarMouseDown || videoInteraction.paused || showSettings)
  }, [pgBarMouseDown, videoInteraction.paused, showSettings, forceShowControls])

  // Set pgBarElmt from ref (for passing to child components)
  useEffect(() => {
    if (pgBarRef.current) {
      setPgBarElmt(pgBarRef.current)
    }
  }, [])

  const getMousePositionProgressBar = useCallback(
    (e: MouseEvent) => {
      if (!pgBarRef.current) return { x: 0, percent: 0, distanceY: 0 }

      const { left, width, top, height } = pgBarRef.current.getBoundingClientRect()
      const offsetX = Math.min(Math.max(e.clientX - left, 0), width)
      const pgBarCenterY = top + height / 2
      const distanceY = Math.abs(e.clientY - pgBarCenterY)

      return {
        x: offsetX,
        percent: offsetX / width,
        distanceY,
      }
    },
    []
  )

  // Store callbacks in refs to avoid circular dependency
  const handleDragRef = useRef<(e: MouseEvent) => void>(() => {})
  const handleMouseupRef = useRef<() => void>(() => {})

  const handleDragProgressBar = useCallback(
    (e: MouseEvent) => {
      videoElmt?.pause()
      const { x, percent, distanceY } = getMousePositionProgressBar(e)
      setPgBarPercent(percent * 100)
      setPgBarDistanceY(distanceY)
      setPgBarHoverX(x)
      setPgBarThumbnailTime((videoElmt?.duration ?? 0) * percent)
    },
    [videoElmt, getMousePositionProgressBar]
  )

  useEffect(() => {
    handleDragRef.current = handleDragProgressBar
  }, [handleDragProgressBar])

  useEffect(() => {
    handleMouseupRef.current = () => {
      window.removeEventListener("mousemove", (e) => handleDragRef.current(e))
      window.removeEventListener("mouseup", handleMouseupRef.current)

      const onTimeUpdate = () => {
        if (pgBarWasVideoPausedRef.current) {
          setPgBarPercent(-1)
        } else {
          videoElmt?.play().then(() => setPgBarPercent(-1))
        }

        if (pgBarShowThumbnailsCenterTimeoutRef.current) {
          clearTimeout(pgBarShowThumbnailsCenterTimeoutRef.current)
        }
        setPgBarShowThumbnailsCenter(false)
        setPgBarShowThumbnails(false)
        setPgBarMouseDown(false)
        setPgBarDistanceY(0)
        videoElmt?.removeEventListener("timeupdate", onTimeUpdate)
      }

      videoElmt?.addEventListener("timeupdate", onTimeUpdate)
      setCurrentTime((videoElmt?.duration ?? 0) * (pgBarPercentRef.current / 100))
    }
  }, [videoElmt, setCurrentTime])

  const handleMousedownProgressBar = useCallback(
    (e: React.MouseEvent) => {
      setPgBarWasVideoPaused(videoElmt?.paused ?? false)
      setPgBarMouseDown(true)
      pgBarShowThumbnailsCenterTimeoutRef.current = setTimeout(() => {
        setPgBarShowThumbnailsCenter(true)
      }, 150)

      handleDragRef.current(e.nativeEvent)

      const dragHandler = (ev: MouseEvent) => handleDragRef.current(ev)
      const mouseupHandler = () => {
        window.removeEventListener("mousemove", dragHandler)
        window.removeEventListener("mouseup", mouseupHandler)
        handleMouseupRef.current()
      }

      window.addEventListener("mousemove", dragHandler)
      window.addEventListener("mouseup", mouseupHandler)
    },
    [videoElmt]
  )

  const handleMousemoveProgressBar = useCallback(
    (e: React.MouseEvent) => {
      if (pgBarMouseDown) return

      const { x, percent } = getMousePositionProgressBar(e.nativeEvent)
      setPgBarHoverX(x)
      setPgBarThumbnailTime((videoElmt?.duration ?? 0) * percent)
    },
    [pgBarMouseDown, videoElmt, getMousePositionProgressBar]
  )

  const handleMouseleaveProgressBar = useCallback(() => {
    if (!pgBarMouseDown) {
      setPgBarShowThumbnails(false)
    }
  }, [pgBarMouseDown])

  const durationFormat = changeDurationFormat
    ? `-${formatDuration(hlsChanges.duration - hlsChanges.videoTimeSecs)}`
    : formatDuration(hlsChanges.videoTimeSecs)

  const controlBtnClass = "p-1.5 rounded-lg bg-background/30 transition-colors  cursor-pointer"

  return (
    <main
      className="overflow-hidden absolute  inset-0 flex flex-col select-none"
      onClick={togglePause}
    >
      <div className="flex-1" onDoubleClick={toggleFullscreen} />

      <div
        className="p-2.5"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
          zIndex: minZindex + 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div
          ref={pgBarRef}
          className={cn("py-3 w-full relative cursor-pointer", pgBarMouseDown && "hover")}
          onMouseMove={handleMousemoveProgressBar}
          onMouseDown={handleMousedownProgressBar}
          onMouseEnter={() => setPgBarShowThumbnails(true)}
          onMouseLeave={handleMouseleaveProgressBar}
        >
          {pBarThumbnailIdx >= 0 && pgBarShowThumbnails && (
            <PlayerThumbnailCurrent
              pgBarDistanceY={pgBarDistanceY}
              fullscreen={fullscreen}
              pgBarElmt={pgBarElmt}
              pBarThumbnailIdx={pBarThumbnailIdx}
              thumbnails={hlsChanges.thumbnails}
              pgBarHoverX={pgBarHoverX}
              pgBarThumbnailTime={pgBarThumbnailTime}
            />
          )}

          {/* Background */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full w-full bg-white/25 pointer-events-none"
            style={{ zIndex: minZindex + 2 }}
          />

          {/* Loaded */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-white/50 pointer-events-none"
            style={{ zIndex: minZindex + 3, width: `${hlsChanges.videoLoadedPercent}%` }}
          />

          {/* Ball */}
          <div
            className="absolute top-0 size-3 rounded-full -translate-x-1/2 translate-y-1/2 bg-primary pointer-events-none"
            style={{ zIndex: minZindex + 4, left: `${pBarPercent}%` }}
          />

          {/* Video Time */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-primary pointer-events-none"
            style={{ zIndex: minZindex + 5, width: `${pBarPercent}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <section className="flex items-center gap-1.5">
            {!disabledControls.includes("rewind10s") && (
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild className={controlBtnClass}>
                  <div className={controlBtnClass} onClick={() => seek((t) => t - 10)}>
                    <SkipBack className="size-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5 z-999">
                  <div className="flex items-center gap-2">
                    Retroceder 10s <Kbd>J</Kbd> <Kbd>&larr;</Kbd>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild className={controlBtnClass}>
                <div className={controlBtnClass} onClick={togglePause}>
                  {videoInteraction.ended ? (
                    <RotateCcw className="size-5" />
                  ) : videoInteraction.paused ? (
                    <Play className="size-5" />
                  ) : (
                    <Pause className="size-5" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="pr-1.5 z-999">
                <div className="flex items-center gap-2">
                  {videoInteraction.ended
                    ? 'Reiniciar'
                    : videoInteraction.paused ? 'Reanudar' : 'Pausar'
                  }
                  <Kbd>K</Kbd> <Kbd><Space /></Kbd>
                </div>
              </TooltipContent>
            </Tooltip>
      

            {!disabledControls.includes("forward10s") && (
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild className={controlBtnClass}>
                  <div className={controlBtnClass} onClick={() => seek((t) => t + 10)}>
                    <SkipForward className="size-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5 z-999">
                  <div className="flex items-center gap-2">
                    Avanzar 10s <Kbd>L</Kbd> <Kbd>&rarr;</Kbd>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            
            {!disabledControls.includes("volume") && (
              <PlayerControlsVolume 
                volume={videoInteraction.volume}
                lastVolume={videoInteraction.lastVolume}
                setVolume={setVolume}
                setLastVolume={setLastVolume}
              />
            )}

            <div
              className={controlBtnClass}
              onClick={() => setChangeDurationFormat((p) => !p)}
            >
              <p className="text-sm">
                {durationFormat} / {formatDuration(hlsChanges.duration)}
              </p>
            </div>
          </section>

          <section className="flex items-center gap-1.5">
            {!disabledControls.includes("settings") && (
              <div className={controlBtnClass} onClick={() => setShowSettings(true)}>
                <Settings className="size-5" />
              </div>
            )}

            {!disabledControls.includes("fullscreen") && (
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild className={controlBtnClass}>
                  <div className={controlBtnClass} onClick={toggleFullscreen}>
                    {fullscreen ? (
                      <Minimize className="size-5" />
                    ) : (
                      <Maximize className="size-5" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5 z-999">
                  <div className="flex items-center gap-2">
                    Pantalla completa <Kbd>F</Kbd>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </section>
        </div>
      </div>

      {showSettings && (
        <PlayerControlsSettings
          zIndex={minZindex + 6}
          hlsChanges={hlsChanges}
          loadLevel={loadLevel}
          setSpeed={setSpeed}
          setSubtitleLanguage={setSubtitleLanguage}
          closeSettings={() => setShowSettings(false)}
          videoElmt={videoElmt}
        />
      )}

      {pBarThumbnailIdx >= 0 && pgBarMouseDown && pgBarShowThumbnailsCenter && (
        <PlayerThumbnailsCenter
          zIndex={minZindex}
          videoElmt={videoElmt}
          pBarThumbnail={hlsChanges.thumbnails[pBarThumbnailIdx]}
        />
      )}
    </main>
  )
}
