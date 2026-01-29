import { cn } from "@/lib/utils"
import type { HlsChanges } from "@/lib/videoPlayer/types"

interface PlayerSubtitlesProps {
  subtitles: HlsChanges['subtitles']
  zIndex: number
  controlsOpen: boolean
}

export const PlayerSubtitles = ({
  subtitles,
  zIndex,
  controlsOpen
}: PlayerSubtitlesProps) => {
  if (!subtitles.enabled || !subtitles.current) {
    return null
  }

  return (
    <div
      className={`${controlsOpen ? 'bottom-20' : 'bottom-2'}  absolute left-1/2 transform -translate-x-1/2 pointer-events-none`}
      style={{ zIndex }}
    >
      <div
        className={cn(
          "text-center px-4 py-2 rounded-md",
          "break-words",
          "text-sm sm:text-base lg:text-lg",
          "shadow-lg bg-background/50"

        )}
        // dangerouslySetInnerHTML={{ __html: subtitles.current }}
      >
        {subtitles.current}
      </div>
    </div>
  )
}