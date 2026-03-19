import { http } from "@/lib/axiosInstance";
import { objectToParams } from "@/lib/objectToParams";
import type {
  CreateReviewRequest,
  UpdateReviewRequest,
  GetReviewsRequest,
  ReviewResponse,
} from "@/types/client/courseReviews";
import type { Pagination } from "@/types/pagination";
import type { AxiosRequestConfig } from "axios";

export class CourseReviewsService {
  static async createReview(data: CreateReviewRequest, config?: AxiosRequestConfig) {
    const { courseSlug, ...body } = data
    const response = await http.post<ReviewResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/course-reviews/${courseSlug}`,
      body,
      config
    )
    return response.data
  }

  static async updateReview(data: UpdateReviewRequest, config?: AxiosRequestConfig) {
    const { reviewId, ...body } = data
    const response = await http.put<ReviewResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/course-reviews/${reviewId}`,
      body,
      config
    )
    return response.data
  }

  static async getReviews(data: GetReviewsRequest & Pagination, config?: AxiosRequestConfig) {
    const { courseSlug, ...params } = data
    const paramsStr = objectToParams(params).toString()
    const response = await http.get<ReviewResponse[]>(
      `${import.meta.env.VITE_D_SERVICE_URL}/course-reviews/${courseSlug}?${paramsStr}`,
      config
    )
    return response.data
  }
}
