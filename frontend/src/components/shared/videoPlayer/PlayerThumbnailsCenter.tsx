import type { ThumbnailsSprite } from "../../../lib/videoPlayer/types"

interface PlayerThumbnailsCenterProps {
  pBarThumbnail: ThumbnailsSprite
  videoElmt: HTMLVideoElement | null
  zIndex: number
}

const IMAGES_IN_COL = 10
const IMAGES_IN_ROW = 10

export const PlayerThumbnailsCenter = ({
  pBarThumbnail,
  videoElmt,
  zIndex,
}: PlayerThumbnailsCenterProps) => {
  if (!videoElmt) return null

  const imgAspectRatio = pBarThumbnail.w / pBarThumbnail.h

  const scale =
    pBarThumbnail.w > pBarThumbnail.h
      ? videoElmt.offsetWidth / pBarThumbnail.w
      : videoElmt.offsetHeight / pBarThumbnail.h

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex }}
    >
      <div
        style={{
          width: pBarThumbnail.w > pBarThumbnail.h ? "100%" : undefined,
          height: pBarThumbnail.w <= pBarThumbnail.h ? "100%" : undefined,
          aspectRatio: `${imgAspectRatio} / 1`,
          backgroundSize: `${pBarThumbnail.w * IMAGES_IN_ROW * scale}px ${pBarThumbnail.h * IMAGES_IN_COL * scale}px`,
          backgroundPosition: `-${pBarThumbnail.x * scale}px -${pBarThumbnail.y * scale}px`,
          backgroundImage: `url(${pBarThumbnail.src})`,
        }}
      />
    </div>
  )
}
