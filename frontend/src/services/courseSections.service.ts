import { http } from "@/lib/axiosInstance"
import type { 
  CourseSectionResponse, 
  CreateCourseSectionRequest,
  DeleteCourseSectionRequest,
  UpdateCourseSectionRequest,
  UpdateCourseSectionPositionRequest
} from "@/types/courseSections"

export class CourseSectionsService {
  static async createCourseSection(payload: CreateCourseSectionRequest) {
    const { data } = await http.post<CourseSectionResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/course-sections/create`, payload
    )
    return data
  }

  static async updateCourseSection(payload: UpdateCourseSectionRequest) {
    const { sectionId, ...body } = payload

    const { data } = await http.put<CourseSectionResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/course-sections/${sectionId}`, body
    )
    return data
  }

  static async updateCourseSectionPosition(payload: UpdateCourseSectionPositionRequest) {
    const { sectionId, ...body } = payload

    await http.put(
      `${import.meta.env.VITE_A_SERVICE_URL}/course-sections/${sectionId}/position`, body
    )
  }

  static async deleteCourseSection(data: DeleteCourseSectionRequest) {
    await http.delete(
      `${import.meta.env.VITE_A_SERVICE_URL}/course-sections/${data.sectionId}`
    )
  }
}