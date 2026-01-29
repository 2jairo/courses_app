import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, Check, Gauge, Settings, Subtitles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HlsChanges } from "../../../lib/videoPlayer/types"
import { PlayerControlsCustomSpeed } from "./playerControlsCustomSpeed"
import { formatLanguage } from "@/lib/format"
import type { VideoPlayerSubtitle } from "@/types/videoPlayer"

interface PlayerControlsSettingsProps {
  hlsChanges: HlsChanges
  loadLevel: (level: number) => void
  setSpeed: (speed: number) => number
  setSubtitleLanguage: (subtitle: VideoPlayerSubtitle | null) => void
  closeSettings: () => void
  zIndex: number
  videoElmt: HTMLVideoElement | null
}

enum MenuOption {
  Home = 0,
  Quality = 1,
  Speed = 2,
  Subtitles = 3,
}

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.25, 1.5, 2, 4]

export const PlayerControlsSettings = ({
  hlsChanges,
  loadLevel,
  setSpeed,
  setSubtitleLanguage,
  closeSettings,
  zIndex,
  videoElmt,
}: PlayerControlsSettingsProps) => {
  const [menuOption, setMenuOption] = useState(MenuOption.Home)
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const innerMenuRef = useRef<HTMLDivElement>(null)
  const outerMenuRef = useRef<HTMLDivElement>(null)

  const setCurrentMenuDimensions = useCallback(() => {
    if (!innerMenuRef.current || !outerMenuRef.current || !videoElmt) return

    const maxWidth = videoElmt.offsetWidth - 20
    const maxHeight = videoElmt.offsetHeight - 70 - 10

    const heightPx = Math.min(innerMenuRef.current.offsetHeight, maxHeight)
    const widthPx = Math.min(outerMenuRef.current.offsetWidth, maxWidth)

    setContainerHeight(heightPx)
    setContainerWidth(widthPx)
  }, [videoElmt])

  useEffect(() => {
    setCurrentMenuDimensions()
  }, [menuOption, hlsChanges, setCurrentMenuDimensions])

  useEffect(() => {
    window.addEventListener("resize", setCurrentMenuDimensions)
    return () => window.removeEventListener("resize", setCurrentMenuDimensions)
  }, [setCurrentMenuDimensions])

  const handlePlayLevel = useCallback(
    (level: number) => {
      loadLevel(level)
      setMenuOption(MenuOption.Home)
    },
    [loadLevel]
  )

  const handleSetSpeed = useCallback(
    (s: number) => {
      setSpeed(s)
      setMenuOption(MenuOption.Home)
    },
    [setSpeed]
  )

  const currentLevel = useMemo(() => {
    const c = hlsChanges.levels[hlsChanges.currentLevel.idx]
    return hlsChanges.currentLevel.auto
      ? { h: "Auto", framerate: 0, pretty: c?.pretty ?? "" }
      : c ?? { h: "Auto", framerate: 0, pretty: "" }
  }, [hlsChanges.levels, hlsChanges.currentLevel])

  const mappedLevels = useMemo(() => {
    return [...hlsChanges.levels.map((l, i) => ({ l, i }))].reverse()
  }, [hlsChanges.levels])

  const menuItemClass = cn(
    "flex items-center justify-between gap-16 p-2 w-full cursor-pointer hover:bg-foreground/10 transition-colors"
  )

  return (
    <div
      className="absolute inset-0"
      style={{ zIndex }}
      onClick={(e) => {
        e.stopPropagation()
        closeSettings()
      }}
    >
      <main
        className="absolute right-2 bottom-17  rounded-md border overflow-y-scroll no-scrollbar overflow-x-hidden border-border bg-background/90 backdrop-blur-sm transition-all duration-200"
        style={{ width: containerWidth, height: containerHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        {menuOption === MenuOption.Home && (
          <section ref={outerMenuRef} className="absolute min-w-42">
            <div ref={innerMenuRef} className="w-full">
              <div className={menuItemClass} onClick={() => setMenuOption(MenuOption.Quality)}>
                <div className="flex items-center gap-2">
                  <Settings className="size-4" />
                  <span>Calidad</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{currentLevel.h}{currentLevel.framerate > 30 ? currentLevel.framerate : ""}</span>
                  {currentLevel.h !== currentLevel.pretty && (
                    <span className="text-xs text-muted-foreground">{currentLevel.pretty}</span>
                  )}
                </div>
              </div>

              <div className={menuItemClass} onClick={() => setMenuOption(MenuOption.Speed)}>
                <div className="flex items-center gap-2">
                  <Gauge className="size-4" />
                  <span>Velocidad</span>
                </div>
                <span>{hlsChanges.speed.toFixed(2)}x</span>
              </div>

              <div 
                className={cn(menuItemClass, hlsChanges.subtitles.subtitles.length === 0 && "pointer-events-none opacity-50")} 
                onClick={() => setMenuOption(MenuOption.Subtitles)}
              >
                <div className="flex items-center gap-2">
                  <Subtitles className="size-4" />
                  <span>Subtítulos</span>
                </div>
                <span>
                  {hlsChanges.subtitles.enabled
                    ? hlsChanges.subtitles.selectedLanguage || "Ninguno"
                    : "Desactivado"}
                </span>
              </div>
            </div>
          </section>
        )}

        {menuOption === MenuOption.Quality && (
          <section ref={outerMenuRef} className="absolute min-w-42">
            <div ref={innerMenuRef} className="w-full">
              <div
                className={cn(menuItemClass, "justify-center border-b border-border")}
                onClick={() => setMenuOption(MenuOption.Home)}
              >
                <div className="flex items-center gap-2">
                  <ArrowLeft className="size-4" />
                  <span>Atrás</span>
                </div>
              </div>

              {mappedLevels.map(({ l, i }) => (
                <div key={i} className={menuItemClass} onClick={() => handlePlayLevel(i)}>
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "size-4",
                        i === hlsChanges.currentLevel.idx && !hlsChanges.currentLevel.auto
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span>{l.h}{l.framerate > 30 ? l.framerate : ""}</span>
                    {l.h !== l.pretty && (
                      <span className="text-xs text-muted-foreground ml-1">{l.pretty}</span>
                    )}
                  </div>
                </div>
              ))}

              <div className={menuItemClass} onClick={() => handlePlayLevel(-1)}>
                <div className="flex items-center gap-2">
                  <Check
                    className={cn(
                      "size-4",
                      hlsChanges.currentLevel.auto ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>Automático</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {menuOption === MenuOption.Speed && (
          <section ref={outerMenuRef} className="absolute min-w-42">
            <div ref={innerMenuRef} className="w-full">
              <div
                className={cn(menuItemClass, "justify-center border-b border-border")}
                onClick={() => setMenuOption(MenuOption.Home)}
              >
                <div className="flex items-center gap-2">
                  <ArrowLeft className="size-4" />
                  <span>Atrás</span>
                </div>
              </div>

              <div className="p-2">
                <PlayerControlsCustomSpeed speed={hlsChanges.speed} setSpeed={setSpeed} />
              </div>

              {SPEED_OPTIONS.map((speed) => (
                <div key={speed} className={menuItemClass} onClick={() => handleSetSpeed(speed)}>
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "size-4",
                        speed === hlsChanges.speed ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>
                      {speed}x {speed === 1 && '(Original)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {menuOption === MenuOption.Subtitles && (
          <section ref={outerMenuRef} className="absolute min-w-42">
            <div ref={innerMenuRef} className="w-full">
              <div
                className={cn(menuItemClass, "justify-center border-b border-border")}
                onClick={() => setMenuOption(MenuOption.Home)}
              >
                <div className="flex items-center gap-2">
                  <ArrowLeft className="size-4" />
                  <span>Atrás</span>
                </div>
              </div>

              {/* Subtitles off option */}
              <div className={menuItemClass} onClick={() => {
                setSubtitleLanguage(null)
                setMenuOption(MenuOption.Home)
              }}>
                <div className="flex items-center gap-2">
                  <Check
                    className={cn(
                      "size-4",
                      !hlsChanges.subtitles.selectedLanguage ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>Desactivado</span>
                </div>
              </div>

              {/* Available subtitle languages */}
              {hlsChanges.subtitles.subtitles.map((track) => (
                <div 
                  key={track.language} 
                  className={menuItemClass} 
                  onClick={() => {
                    setSubtitleLanguage(track)
                    setMenuOption(MenuOption.Home)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "size-4",
                        track.language === hlsChanges.subtitles.selectedLanguage ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{formatLanguage(track.language)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
