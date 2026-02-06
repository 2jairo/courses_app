import { http } from "@/lib/axiosInstance"
import type {
  CreateLectureRequest,
  UpdateLectureRequest,
  UpdateLecturePositionRequest,
  MoveLectureToSectionRequest,
  DeleteLectureRequest,
  LectureResponse,
  GetLectureRequest,
} from "@/types/dashboard/lectures"
import type { AxiosRequestConfig } from "axios";

export class LecturesService {
  static async createLecture(payload: CreateLectureRequest, config?: AxiosRequestConfig) {
    const { data } = await http.post<LectureResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/lectures/create`,
      payload,
      config
    )
    return data
  }

  static async getLecture(payload: GetLectureRequest, config?: AxiosRequestConfig) {
    const { data } = await http.get<LectureResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/lectures/${payload.lectureId}`,
      config
    )
    return data
  }

  static async updateLecture(payload: UpdateLectureRequest, config?: AxiosRequestConfig) {
    const { lectureId, ...body } = payload

    const { data } = await http.put<LectureResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/lectures/${lectureId}`,
      body,
      config
    )
    return data
  }

  static async updateLecturePosition(payload: UpdateLecturePositionRequest, config?: AxiosRequestConfig) {
    const { lectureId, ...body } = payload

    await http.put(
      `${import.meta.env.VITE_A_SERVICE_URL}/lectures/${lectureId}/position`,
      body,
      config
    )
  }

  static async moveLectureToSection(payload: MoveLectureToSectionRequest, config?: AxiosRequestConfig) {
    const { lectureId, ...body } = payload

    await http.put(
      `${import.meta.env.VITE_A_SERVICE_URL}/lectures/${lectureId}/section`,
      body,
      config
    )
  }

  static async deleteLecture(data: DeleteLectureRequest, config?: AxiosRequestConfig) {
    await http.delete(
      `${import.meta.env.VITE_A_SERVICE_URL}/lectures/${data.lectureId}`,
      config
    )
  }
}
