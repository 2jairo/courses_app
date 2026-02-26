import { http } from "@/lib/axiosInstance"
import type { GetVideoSubtitlesRequest, GetVideoSubtitlesResponse, GetVideoThumbnailsRequest } from "@/types/videoPlayer"
import type { AxiosRequestConfig } from "axios"

export class VideoPlayerService {
  static async fetchThumbnails(payload: GetVideoThumbnailsRequest, config?: AxiosRequestConfig) {
    const { data } = await http.get<string>(payload.thumbnailsUrl, {
      ...config,
      responseType: 'text',
    })
    return data
  }
  
  static async fetchSubtitles(payload: GetVideoSubtitlesRequest, config?: AxiosRequestConfig) {
    const { data } = await http.get<string>(payload.subtitleUrl, {
      ...config,
      responseType: 'text',
    })

    return { language: payload.language, subtitles: data } as GetVideoSubtitlesResponse
  }
}
