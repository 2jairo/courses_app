import { http } from "@/lib/axiosInstance"
import type { SetFilesToLectureRequest, GetLectureFilesRequest, LectureFileResponse } from "@/types/lectureAssets"

export class LectureAssetsService {
  static async setFilesToLecture(payload: SetFilesToLectureRequest) {
    const { lectureId, ...body } = payload

    await http.post(
      `${import.meta.env.VITE_A_SERVICE_URL}/lecture-assets/${lectureId}/files`,body
    )
  }

  static async getLectureFiles(payload: GetLectureFilesRequest) {
    const { data } = await http.get<LectureFileResponse[]>(
      `${import.meta.env.VITE_A_SERVICE_URL}/lecture-assets/${payload.lectureId}/files`
    )
    return data
  }
}