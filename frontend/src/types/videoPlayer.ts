export interface GetVideoThumbnailsRequest {
  thumbnailsUrl: string
}


export interface VideoPlayerSubtitle {
  language: string
  native: boolean
  path: string
}


export interface GetVideoSubtitlesRequest {
  language: string
  subtitleUrl: string,
}

export interface GetVideoSubtitlesResponse {
  language: string
  subtitles: string
}