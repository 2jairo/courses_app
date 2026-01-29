import { http } from "@/lib/axiosInstance"
import type { GetVideoSubtitlesRequest, GetVideoSubtitlesResponse, GetVideoThumbnailsRequest } from "@/types/videoPlayer"

export class VideoPlayerService {
  static async fetchThumbnails(payload: GetVideoThumbnailsRequest) {
    const { data } = await http.get<string>(payload.thumbnailsUrl, {
      responseType: 'text'
    })
    return data
  }
  
  static async fetchSubtitles(payload: GetVideoSubtitlesRequest) {
    const { data } = await http.get<string>(payload.subtitleUrl, {
      responseType: 'text'
    })

    return { language: payload.language, subtitles: data } as GetVideoSubtitlesResponse
  }
}
