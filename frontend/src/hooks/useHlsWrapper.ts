import { useCallback, useEffect, useRef, useState } from "react"
import Hls, { Events as HlsEvents, Level } from "hls.js"
import type { HlsChanges, HlsWrapperStartControls, VideoInteraction } from "../lib/videoPlayer/types"
import { videoResolutionPretty } from "@/lib/format"
import { parseSubtitles, parseThumbnails } from "@/lib/videoPlayer/vttParser"
import { JwtService } from "@/services/jwt.service"
import type { VideoPlayerSubtitle } from "@/types/videoPlayer"
import { VideoPlayerService } from "@/services/videoPlayer.service"

const LSKeys = {
  volume: "player__volume",
  bandwith: "player__bw",
}


interface UseHlsWrapperProps {
  videoUrl: string
  thumbnailsUrl: string
  subtitles: VideoPlayerSubtitle[]
  startControls?: HlsWrapperStartControls
}

export const useHlsWrapper = ({
  videoUrl,
  startControls = {},
  subtitles,
  thumbnailsUrl,
}: UseHlsWrapperProps) => {
  const hlsRef = useRef<Hls | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [hlsChanges, setHlsChanges] = useState<HlsChanges>({
    currentLevel: { auto: true, idx: -1 },
    levels: [],
    videoTimePercent: 0,
    videoTimeSecs: 0,
    videoLoadedPercent: 0,
    duration: 0,
    thumbnails: [],
    subtitles: {
      subtitles,
      current: "",
      enabled: false,
      selectedLanguage: null,
      tracks: {}
    },
    speed: 1.0,
  })

  const [videoInteraction, setVideoInteraction] = useState<VideoInteraction>({
    paused: true,
    ended: false,
    volume: 1,
    lastVolume: 0.5,
    changes: 0,
  })

  const updateLevels = useCallback((levels: Level[]) => {
    setHlsChanges((prev) => ({
      ...prev,
      levels: levels.map((l) => ({
        h: `${l.height}p`,
        framerate: l.frameRate,
        pretty: videoResolutionPretty(l.height),
      })),
    }))
  }, [])

  const onTimeUpdate = useCallback(() => {
    const videoElmt = videoRef.current
    if (!videoElmt) return

    const currentTime = videoElmt.currentTime
    
    setHlsChanges((prev) => {
      let currentSubtitle = ""
      const { enabled, selectedLanguage, tracks } = prev.subtitles

      if (enabled && selectedLanguage && tracks[selectedLanguage]) {
        const current = tracks[selectedLanguage].find((subtitle) => {
          return currentTime >= subtitle.start && currentTime <= subtitle.end
        })
        currentSubtitle = current?.text || ""
      }

      return {
        ...prev,
        videoTimePercent: (currentTime / videoElmt.duration) * 100,
        videoTimeSecs: currentTime,
        videoLoadedPercent: videoElmt.buffered.length
          ? (videoElmt.buffered.end(videoElmt.buffered.length - 1) / videoElmt.duration) * 100
          : 0,
        subtitles: {
          ...prev.subtitles,
          current: currentSubtitle
        }
      }
    })

    const newEnded = videoElmt.currentTime === videoElmt.duration
    setVideoInteraction((prev) => {
      if (prev.ended !== newEnded) {
        return { ...prev, ended: newEnded }
      }
      return { ...prev }
    })
  }, [])

  const initHls = useCallback(
    (videoElmt: HTMLVideoElement) => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxMaxBufferLength: 10,
        xhrSetup(xhr) {
          const token = JwtService.getAccessToken()
          if(token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
          }
        },
        maxLoadingDelay: 3,
      })

      hls.loadSource(videoUrl)
      hls.attachMedia(videoElmt)

      // HLS Events
      hls.on(HlsEvents.LEVEL_SWITCHED, (_, data) => {
        setHlsChanges((prev) => ({
          ...prev,
          currentLevel: { ...prev.currentLevel, idx: data.level },
        }))
      })

      hls.on(HlsEvents.FRAG_BUFFERED, () => {
        onTimeUpdate()
      })

      hls.on(HlsEvents.LEVELS_UPDATED, (_, data) => {
        updateLevels(data.levels)
      })

      hls.on(HlsEvents.MANIFEST_PARSED, (_, data) => {
        updateLevels(data.levels)
      })

      // Apply bandwidth estimate from localStorage
      const bwEstimate = localStorage.getItem(LSKeys.bandwith)
      if (bwEstimate) {
        hls.bandwidthEstimate = parseFloat(bwEstimate)
      }

      hlsRef.current = hls
      videoRef.current = videoElmt

      // Video Event Listeners
      const handleLoadedMetadata = () => {
        setHlsChanges((prev) => ({
          ...prev,
          duration: videoElmt.duration,
        }))

        // Apply start controls
        if (startControls.secs !== undefined) {
          videoElmt.currentTime = startControls.secs
        }
        if (startControls.volume !== undefined) {
          videoElmt.volume = startControls.volume
        }
      }

      const handleVolumeChange = () => {
        setVideoInteraction((prev) => ({
          ...prev,
          volume: videoElmt.volume,
        }))
      }

      const handlePause = () => {
        setVideoInteraction((prev) => ({ ...prev, paused: true }))
      }

      const handlePlay = () => {
        setVideoInteraction((prev) => ({ ...prev, paused: false }))
      }

      videoElmt.addEventListener("loadedmetadata", handleLoadedMetadata)
      videoElmt.addEventListener("timeupdate", onTimeUpdate)
      videoElmt.addEventListener("volumechange", handleVolumeChange)
      videoElmt.addEventListener("pause", handlePause)
      videoElmt.addEventListener("play", handlePlay)

      // Set initial states
      setVideoInteraction((prev) => ({
        ...prev,
        paused: videoElmt.paused,
        volume: videoElmt.volume,
      }))

      return () => {
        videoElmt.removeEventListener("loadedmetadata", handleLoadedMetadata)
        videoElmt.removeEventListener("timeupdate", onTimeUpdate)
        videoElmt.removeEventListener("volumechange", handleVolumeChange)
        videoElmt.removeEventListener("pause", handlePause)
        videoElmt.removeEventListener("play", handlePlay)
        hls.destroy()
      }
    },
    [videoUrl, startControls, updateLevels, onTimeUpdate]
  )

  useEffect(() => {
    VideoPlayerService.fetchThumbnails({ thumbnailsUrl: thumbnailsUrl }).then((resp) => {        
      const basePath = thumbnailsUrl.split("/")
      basePath.pop()
      const basePathString = basePath.join('/')
  
      const thumbnailsQueryResp = parseThumbnails(resp).map((thumbnail) => {
        return {
          ...thumbnail,
          src: `${basePathString}/${thumbnail.src}`
        }
      })

      setHlsChanges((prev) => {
        return {
          ...prev,
          thumbnails: thumbnailsQueryResp,
        }
      })
    })
  }, [thumbnailsUrl])
  

  // Cleanup
  useEffect(() => {
    return () => {
      if (hlsRef.current && !isNaN(hlsRef.current.bandwidthEstimate)) {
        localStorage.setItem(LSKeys.bandwith, hlsRef.current.bandwidthEstimate.toString())
      }
      if (videoRef.current && !startControls.ignoreLocalStorage) {
        localStorage.setItem(LSKeys.volume, videoRef.current.volume.toString())
      }
    }
  }, [startControls.ignoreLocalStorage])


  const seek = (cb: (currentTime: number) => number) => {
    const videoElmt = videoRef.current
    if (!videoElmt) return

    const newTime = Math.max(Math.min(cb(videoElmt.currentTime), videoElmt.duration), 0)
    videoElmt.currentTime = newTime

    setVideoInteraction((prev) => ({
      ...prev,
      changes: prev.changes + 1,
    }))
  }

  const setCurrentTime = (time: number) => {
    const videoElmt = videoRef.current
    if (!videoElmt) return
    videoElmt.currentTime = time
  }

  const togglePause = () => {
    const videoElmt = videoRef.current
    if (!videoElmt) return

    if (videoElmt.paused) {
      videoElmt.play()
    } else {
      videoElmt.pause()
    }
  }

  const loadLevel = (level: number) => {
    setHlsChanges((prev) => ({
      ...prev,
      currentLevel: { ...prev.currentLevel, auto: level === -1 },
    }))

    if (hlsRef.current) {
      hlsRef.current.nextLevel = level
    }
  }

  const setSpeed = (speed: number) => {
    const videoElmt = videoRef.current
    if (!videoElmt) return speed

    const s = Math.min(Math.max(speed, 0.25), 4)
    videoElmt.playbackRate = s

    setHlsChanges((prev) => ({
      ...prev,
      speed: s,
    }))

    return s
  }

  const setVolume = (volume: number) => {
    const videoElmt = videoRef.current
    if (!videoElmt) return

    videoElmt.volume = Math.min(Math.max(volume, 0), 1)
  }
  
  const setLastVolume = (volume: number) => {
    setVideoInteraction((prev) => ({
      ...prev,
      lastVolume: volume
    }))
  }

  const setSubtitleLanguage = (subtitle: VideoPlayerSubtitle | null) => {
    if(!subtitle) {
      return setHlsChanges((prev) => {
        return { 
          ...prev,
          subtitles: {
            ...prev.subtitles,
            selectedLanguage: null,
            enabled: false
          }
        }
      })
    }

    VideoPlayerService.fetchSubtitles({ language: subtitle.language, subtitleUrl: subtitle.path })
      .then((resp) => {
        const parsed = parseSubtitles(resp.subtitles)

        setHlsChanges((prev) => {
          return { 
            ...prev,
            subtitles: {
              ...prev.subtitles,
              tracks: {
                ...prev.subtitles.tracks,
                [resp.language]: parsed
              },
              selectedLanguage: subtitle.language,
              enabled: true
            }
          }
        })
      })
  }

  return {
    hlsRef,
    videoRef,
    hlsChanges,
    videoInteraction,
    initHls,
    seek,
    setCurrentTime,
    togglePause,
    loadLevel,
    setSpeed,
    setVolume,
    setLastVolume,
    setSubtitleLanguage,
  }
}