import type { UploadFilesResponse } from "./files"

//REQUEST
export interface SetFilesToLectureRequest {
  lectureId: number
  fileIds: number[]
}

export interface GetLectureFilesRequest {
  lectureId: number
}

//RESPONSE
export interface LectureFileResponse {
  id: number
  lectureId: number
  fileId: number
  file: UploadFilesResponse
  createdAt: string
}


