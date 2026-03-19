import { http } from '@/lib/axiosInstance'
import { objectToParams } from '@/lib/objectToParams'
import type { AxiosRequestConfig } from 'axios'
import type {
  CreateLectureCommentRequest,
  DeleteLectureCommentRequest,
  GetLectureCommentsRequest,
  LectureCommentResponse,
  UpdateLectureCommentRequest,
} from '@/types/client/lectureComments'
import type { Pagination } from '@/types/pagination'

export class ClientLectureCommentsService {
  static async getComments(req: GetLectureCommentsRequest & Pagination, config?: AxiosRequestConfig) {
    const { lectureSlug, ...queryParams } = req
    const paramsStr = objectToParams(queryParams)
    const url = `${import.meta.env.VITE_D_SERVICE_URL}/lecture-comments/${lectureSlug}?${paramsStr}`
    
    const response = await http.get<LectureCommentResponse[]>(url, config)
    return response.data
  }

  static async createComment(req: CreateLectureCommentRequest, config?: AxiosRequestConfig) {
    const { lectureSlug, ...body } = req
    const url = `${import.meta.env.VITE_D_SERVICE_URL}/lecture-comments/${lectureSlug}`
    
    const response = await http.post<LectureCommentResponse>(url, body, config)
    return response.data
  }

  static async updateComment(req: UpdateLectureCommentRequest, config?: AxiosRequestConfig) {
    const { commentId, ...body } = req
    const url = `${import.meta.env.VITE_D_SERVICE_URL}/lecture-comments/${commentId}`
    
    const response = await http.put<LectureCommentResponse>(url, body, config)
    return response.data
  }

  static async deleteComment(req: DeleteLectureCommentRequest, config?: AxiosRequestConfig) {
    const url = `${import.meta.env.VITE_D_SERVICE_URL}/lecture-comments/${req.commentId}`
    await http.delete(url, config)
  }
}
