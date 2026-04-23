import { http } from "@/lib/axiosInstance";
import { objectToParams } from "@/lib/objectToParams";
import type { ToggleFavoriteCourseRequest } from "@/types/client/favCourses";
import type { SearchCoursesCourseResponse } from "@/types/client/search";
import type { Pagination } from "@/types/pagination";
import type { AxiosRequestConfig } from "axios";

export class ClientFavoriteCoursesService {
  static async getFavoriteCourses(pagination: Pagination, config?: AxiosRequestConfig) {
    const params = objectToParams(pagination).toString()

    const response = await http.get<SearchCoursesCourseResponse[]>(
      `${import.meta.env.VITE_D_SERVICE_URL}/favorite-courses?${params}`,
      config
    )
    return response.data
  }

  static async toggleFavoriteCourse(data: ToggleFavoriteCourseRequest, config?: AxiosRequestConfig) {
    const response = await http.put<void>(
      `${import.meta.env.VITE_D_SERVICE_URL}/favorite-courses/${data.courseId}?new=${data.newValue}`,
      undefined,
      config
    )
    return response.data
  }
}
