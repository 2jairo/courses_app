import { http } from "@/lib/axiosInstance";
import { objectToParams } from "@/lib/objectToParams";
import type { CreateQuizRequest, DeleteQuizRequest, GetQuizzesRequest, GetQuizDetailsRequest, QuizResponse, QuizResponseExtended, UpdateQuizRequest } from "@/types/dashboard/quizzes"
import type { Pagination } from "@/types/pagination";
import type { AxiosRequestConfig } from "axios";

export class QuizzesService {
  static async createQuiz(payload: CreateQuizRequest, config?: AxiosRequestConfig) {
    const { courseId, ...body } = payload

    const { data } = await http.post<QuizResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/quizzes/create/${courseId}`, body, config
    )
    return data
  }

  static async getQuizzes(payload: GetQuizzesRequest & Pagination, config?: AxiosRequestConfig) {
    const { courseId, q, ...params } = payload
    
    const paramsStr = (!!q && q.length >= 3)
      ? objectToParams({ ...params, q }).toString()
      : objectToParams(params).toString()

    const response = await http.get<QuizResponse[]>(
      `${import.meta.env.VITE_A_SERVICE_URL}/quizzes/${courseId}?${paramsStr}`,
      { ...config }
    )
    return response.data
  }

  static async getQuizDetails(params: GetQuizDetailsRequest, config?: AxiosRequestConfig) {
    const response = await http.get<QuizResponseExtended>(
      `${import.meta.env.VITE_A_SERVICE_URL}/quizzes/${params.courseId}/${params.quizId}`, config
    )
    return response.data
  }

  static async deleteQuiz(params: DeleteQuizRequest, config?: AxiosRequestConfig) {
    await http.delete(
      `${import.meta.env.VITE_A_SERVICE_URL}/quizzes/${params.quizId}`, config
    )
  }

  static async updateQuiz(payload: UpdateQuizRequest, config?: AxiosRequestConfig) {
    const { quizId, ...body } = payload

    const { data } = await http.put<QuizResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/quizzes/${quizId}`, body, config
    )
    return data
  }
}
