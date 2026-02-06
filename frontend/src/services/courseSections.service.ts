import { http } from "@/lib/axiosInstance"
import type { 
  CourseSectionResponse, 
  CreateCourseSectionRequest,
  DeleteCourseSectionRequest,
  UpdateCourseSectionRequest,
  UpdateCourseSectionPositionRequest
} from "@/types/dashboard/courseSections"
import type { AxiosRequestConfig } from "axios"

export class CourseSectionsService {
  static async createCourseSection(payload: CreateCourseSectionRequest, config?: AxiosRequestConfig) {
    const { data } = await http.post<CourseSectionResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/course-sections/create`, payload, config
    )
    return data
  }

  static async updateCourseSection(payload: UpdateCourseSectionRequest, config?: AxiosRequestConfig) {
    const { sectionId, ...body } = payload

    const { data } = await http.put<CourseSectionResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/course-sections/${sectionId}`, body, config
    )
    return data
  }

  static async updateCourseSectionPosition(payload: UpdateCourseSectionPositionRequest, config?: AxiosRequestConfig) {
    const { sectionId, ...body } = payload

    await http.put(
      `${import.meta.env.VITE_A_SERVICE_URL}/course-sections/${sectionId}/position`, body, config
    )
  }

  static async deleteCourseSection(data: DeleteCourseSectionRequest, config?: AxiosRequestConfig) {
    await http.delete(
      `${import.meta.env.VITE_A_SERVICE_URL}/course-sections/${data.sectionId}`, config
    )
  }
}