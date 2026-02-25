import { http } from "@/lib/axiosInstance";
import type { CreateQuestionRequest, UpdateQuestionRequest, DeleteQuestionRequest, UpdateQuestionPositionRequest, QuizQuestionResponse } from "@/types/dashboard/quizzesQuestions"
import type { AxiosRequestConfig } from "axios";

export class QuizzesQuestionsService {
  static async createQuestion(payload: CreateQuestionRequest, config?: AxiosRequestConfig) {
    const { quizId, ...body } = payload

    const { data } = await http.post<QuizQuestionResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/quizzes-questions/create/${quizId}`, body, config
    )
    return data
  }

  static async updateQuestion(payload: UpdateQuestionRequest, config?: AxiosRequestConfig) {
    const { questionId, ...body } = payload

    const { data } = await http.put<QuizQuestionResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/quizzes-questions/${questionId}`, body, config
    )
    return data
  }

  static async updateQuestionPosition(payload: UpdateQuestionPositionRequest, config?: AxiosRequestConfig) {
    const { questionId, ...body } = payload

    const { data } = await http.put<QuizQuestionResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/quizzes-questions/${questionId}/position`, body, config
    )
    return data
  }

  static async deleteQuestion(params: DeleteQuestionRequest, config?: AxiosRequestConfig) {
    await http.delete(
      `${import.meta.env.VITE_A_SERVICE_URL}/quizzes-questions/${params.questionId}`, config
    )
  }
}
