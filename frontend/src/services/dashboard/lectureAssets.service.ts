import { http } from "@/lib/axiosInstance"
import type { SetFilesToLectureRequest, GetLectureFilesRequest, LectureFileResponse } from "@/types/dashboard/lectureAssets"
import type { AxiosRequestConfig } from "axios"

export class LectureAssetsService {
  static async setFilesToLecture(payload: SetFilesToLectureRequest, config?: AxiosRequestConfig) {
    const { lectureId, ...body } = payload

    await http.post(
      `${import.meta.env.VITE_A_SERVICE_URL}/lecture-assets/${lectureId}/files`, body, config
    )
  }

  static async getLectureFiles(payload: GetLectureFilesRequest, config?: AxiosRequestConfig) {
    const { data } = await http.get<LectureFileResponse[]>(
      `${import.meta.env.VITE_A_SERVICE_URL}/lecture-assets/${payload.lectureId}/files`, config
    )
    return data
  }
}