import { http } from "@/lib/axiosInstance";
import type { PlayLectureRequest, PlayLectureResponse } from "@/types/client/lectures";
import type { AxiosRequestConfig } from "axios";

export class ClientLecturesService {
  static async getPlayLecture(data: PlayLectureRequest, config?: AxiosRequestConfig) {
    const response = await http.get<PlayLectureResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/lectures/play/${data.lectureSlug}`, config
    )
    return response.data
  }
}