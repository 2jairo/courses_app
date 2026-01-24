import { http } from "@/lib/axiosInstance"
import type {
  CreateLectureRequest,
  UpdateLectureRequest,
  UpdateLecturePositionRequest,
  MoveLectureToSectionRequest,
  DeleteLectureRequest,
  LectureResponse,
  GetLectureRequest,
} from "@/types/lectures"

export class LecturesService {
  static async createLecture(payload: CreateLectureRequest) {
    const { data } = await http.post<LectureResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/lectures/create`,
      payload
    )
    return data
  }

  static async getLecture(payload: GetLectureRequest) {
    const { data } = await http.get<LectureResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/lectures/${payload.lectureId}`
    )
    return data
  }

  static async updateLecture(payload: UpdateLectureRequest) {
    const { lectureId, ...body } = payload

    const { data } = await http.put<LectureResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/lectures/${lectureId}`,
      body
    )
    return data
  }

  static async updateLecturePosition(payload: UpdateLecturePositionRequest) {
    const { lectureId, ...body } = payload

    await http.put(
      `${import.meta.env.VITE_A_SERVICE_URL}/lectures/${lectureId}/position`,
      body
    )
  }

  static async moveLectureToSection(payload: MoveLectureToSectionRequest) {
    const { lectureId, ...body } = payload

    await http.put(
      `${import.meta.env.VITE_A_SERVICE_URL}/lectures/${lectureId}/section`,
      body
    )
  }

  static async deleteLecture(data: DeleteLectureRequest) {
    await http.delete(
      `${import.meta.env.VITE_A_SERVICE_URL}/lectures/${data.lectureId}`
    )
  }
}
