import { VideoPlayer } from "@/components/shared/player/player"
import type { PlayLectureResponse, PlayLectureResponseKindVideo } from "@/types/client/lectures"

interface PlayVideoProps {
  lecture: PlayLectureResponse & { kind: "Video"; data: PlayLectureResponseKindVideo }
}

export function PlayVideo({ lecture }: PlayVideoProps) {
  const videoData = lecture.data

  return (
    <div className="w-full aspect-video bg-black">
      <VideoPlayer
        baseUrl={videoData.cdn.base}
        videoSrc={videoData.mediaPlaylist}
        poster={videoData.poster}
        thumbnails={videoData.thumbnails}
        subtitles={videoData.subtitles}
        autoplay={true}
        minZindex={10}
        className="h-full"
      />
    </div>
  )
}
