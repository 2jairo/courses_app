import { http } from "@/lib/axiosInstance"
import { objectToParams } from "@/lib/objectToParams"
import type { SearchCoursesCourseResponse } from "@/types/client/search"
import type { ProfileUserCourseResponse, ProfileUserInfoResponse } from "@/types/client/profile"
import type { CourseResponse } from "@/types/dashboard/courses"
import type { Pagination } from "@/types/pagination"
import type { AxiosRequestConfig } from "axios"

const mapDashboardCourseToSearchCourse = (course: CourseResponse): SearchCoursesCourseResponse => ({
  id: String(course.id),
  slug: course.slug,
  updatedAt: Number(new Date(course.updatedAt).getTime() || 0),
  lectureAccesibility: course.lectureAccesibility,
  title: course.title,
  description: course.description,
  poster: course.poster || "",
  language: course.language,
  lecturesAmmount: course.lecturesAmmount,
  price: course.price,
  discountPercent: course.discountPercent,
  tags: course.tags.map((tag) => tag.name),
  author: "Tu",
  avgRating: course.stats.avgRating,
  totalReviews: course.stats.totalReviews,
  totalPurchases: course.stats.totalPurchases,
})

export class ClientProfileService {
  static async getUserInfo(config?: AxiosRequestConfig) {
    const response = await http.get<ProfileUserInfoResponse>(
      `${import.meta.env.VITE_B_SERVICE_URL}/auth/user`,
      config
    )
    return response.data
  }

  static async getUserPurchasedCourses(pagination: Pagination, config?: AxiosRequestConfig) {
    const params = objectToParams(pagination).toString()

    const response = await http.get<ProfileUserCourseResponse[]>(
      `${import.meta.env.VITE_D_SERVICE_URL}/course-purchases?${params}`,
      config
    )
    return response.data
  }

  static async getUserCreatedCourses(config?: AxiosRequestConfig) {
    const response = await http.get<CourseResponse[]>(
      `${import.meta.env.VITE_A_SERVICE_URL}/courses?page=1&size=100`,
      config
    )

    // Created courses are the ones where the current user is the owner.
    return response.data
      .filter((course) => course.role === "Owner")
      .map(mapDashboardCourseToSearchCourse)
  }
}
