import { useMemo } from "react"
import type { ThumbnailsSprite } from "../../../lib/videoPlayer/types"
import { formatDuration } from "@/lib/format"

interface PlayerThumbnailCurrentProps {
  pgBarElmt: HTMLDivElement | null
  pBarThumbnailIdx: number
  thumbnails: ThumbnailsSprite[]
  pgBarHoverX: number
  pgBarThumbnailTime: number
  fullscreen: boolean
  pgBarDistanceY: number
}

const IMAGES_IN_COL = 10
const IMAGES_IN_ROW = 10

export const PlayerThumbnailCurrent = ({
  pgBarElmt,
  pBarThumbnailIdx,
  thumbnails,
  pgBarHoverX,
  pgBarThumbnailTime,
  fullscreen,
  pgBarDistanceY,
}: PlayerThumbnailCurrentProps) => {
  const size = fullscreen ? 300 : 160
  const wide = pgBarDistanceY > 50

  const pBarThumbnail = thumbnails[pBarThumbnailIdx]
  const imgAspectRatio = pBarThumbnail ? pBarThumbnail.w / pBarThumbnail.h : 16 / 9

  const scale = useMemo(() => {
    if (!pBarThumbnail) return 1
    return pBarThumbnail.w > pBarThumbnail.h ? size / pBarThumbnail.w : size / pBarThumbnail.h
  }, [pBarThumbnail, size])

  const thumbnailsToShow = useMemo(() => {
    return wide ? thumbnails : [thumbnails[pBarThumbnailIdx]]
  }, [wide, thumbnails, pBarThumbnailIdx])

  const containerLeft = useMemo(() => {
    if (!pgBarElmt || !pBarThumbnail) return 0

    if (wide) return pgBarElmt.offsetWidth / 2

    const thumbWidth = pBarThumbnail.w > pBarThumbnail.h ? size : size * imgAspectRatio
    const min = thumbWidth / 2
    const max = pgBarElmt.offsetWidth - thumbWidth / 2
    return Math.max(Math.min(pgBarHoverX, max), min)
  }, [wide, pgBarElmt, pgBarHoverX, size, imgAspectRatio, pBarThumbnail])

  const containerDimensions = useMemo(() => {
    if (!pBarThumbnail) return { w: 0, h: 0 }
    return pBarThumbnail.w > pBarThumbnail.h
      ? { w: size * thumbnailsToShow.length, h: size / imgAspectRatio }
      : { w: size * thumbnailsToShow.length * imgAspectRatio, h: size }
  }, [pBarThumbnail, size, thumbnailsToShow.length, imgAspectRatio])

  const contentLeft = useMemo(() => {
    if (!wide || !pgBarElmt || !pBarThumbnail) return "-50%"

    const thumbWidth = pBarThumbnail.w > pBarThumbnail.h ? size : size * imgAspectRatio
    const leftOffset = (pgBarHoverX / pgBarElmt.offsetWidth) * (thumbnailsToShow.length * thumbWidth)
    return `${-leftOffset}px`
  }, [wide, pgBarElmt, pgBarHoverX, size, imgAspectRatio, pBarThumbnail, thumbnailsToShow.length])

  if (!pBarThumbnail || !pgBarElmt) return null

  return (
    <div
      className="pointer-events-none flex flex-col absolute -top-2.5 -translate-x-1/2 -translate-y-full"
      style={{
        left: `${containerLeft}px`,
        width: `${containerDimensions.w}px`,
        height: `${containerDimensions.h}px`,
      }}
    >
      <div
        className="absolute translate-x-1/2 top-0 flex rounded-md border border-border overflow-hidden"
        style={{ left: contentLeft }}
      >
        {thumbnailsToShow.map((th, idx) => (
          <div
            key={idx}
            style={{
              width: th.w > th.h ? `${size}px` : undefined,
              height: th.w <= th.h ? `${size}px` : undefined,
              aspectRatio: `${imgAspectRatio} / 1`,
              backgroundSize: `${th.w * IMAGES_IN_ROW * scale}px ${th.h * IMAGES_IN_COL * scale}px`,
              backgroundPosition: `-${th.x * scale}px -${th.y * scale}px`,
              backgroundImage: `url(${th.src})`,
            }}
          />
        ))}
      </div>

      <section className="absolute bottom-full w-full text-center">
        <p className="text-sm font-medium">{formatDuration(pgBarThumbnailTime)}</p>
        <p className="text-xs text-muted-foreground">Arrastra hacia arriba para búsqueda precisa ↑</p>
      </section>

      {wide && (
        <div className="absolute bg-white w-px h-full top-0 left-1/2 -translate-x-1/2" />
      )}
    </div>
  )
}
