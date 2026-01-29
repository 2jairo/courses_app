import { VideoPlayer } from "@/components/shared/player/player";

const s = [
  {
    "path": "subtitles/en.vtt",
    "native": false,
    "language": "en"
  },
  {
    "path": "subtitles/es.vtt",
    "native": true,
    "language": "es"
  },
  {
    "path": "subtitles/fr.vtt",
    "native": false,
    "language": "fr"
  }
]

export default function Home() {
  return (
    <VideoPlayer 
      baseUrl="http://localhost:8080/7"
      poster="posters/0.webp"
      thumbnails="thumbnails/t.vtt"
      videoSrc="index.m3u8"
      subtitles={s}
    />
  )
}
