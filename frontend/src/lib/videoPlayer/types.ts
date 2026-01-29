import type { VideoPlayerSubtitle } from "@/types/videoPlayer"

export type ThumbnailsSprite = {
  start: number
  end: number
  src: string
  x: number
  y: number
  w: number
  h: number
}

export type SubtitleCue = {
  start: number
  end: number
  text: string
}

export type HlsChanges = {
  currentLevel: {
    auto: boolean
    idx: number
  }
  levels: {
    h: string
    framerate: number
    pretty: string
  }[]
  videoLoadedPercent: number
  videoTimePercent: number
  videoTimeSecs: number
  duration: number
  thumbnails: ThumbnailsSprite[]
  subtitles: {
    subtitles: VideoPlayerSubtitle[]
    tracks: Record<string, SubtitleCue[]>
    selectedLanguage: string | null
    enabled: boolean
    current: string
  }
  speed: number
}

export type VideoInteraction = {
  paused: boolean
  ended: boolean
  volume: number
  changes: number
}

export type HlsWrapperStartControls = {
  volume?: number
  secs?: number
  lang?: string
  ignoreLocalStorage?: boolean
}

export type DisabledControls = 'fullscreen' | 'volume' | 'settings' | 'nextLecture' | 'prevLecture' 
