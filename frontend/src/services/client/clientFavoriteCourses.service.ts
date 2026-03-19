import { http } from "@/lib/axiosInstance";
import type { ToggleFavoriteCourseRequest } from "@/types/client/favCourses";
import type { AxiosRequestConfig } from "axios";

export class ClientFavoriteCoursesService {
  static async toggleFavoriteCourse(data: ToggleFavoriteCourseRequest, config?: AxiosRequestConfig) {
    const response = await http.put<void>(
      `${import.meta.env.VITE_D_SERVICE_URL}/favorite-courses/${data.courseId}?new=${data.newValue}`,
      undefined,
      config
    )
    return response.data
  }
}
