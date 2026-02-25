import { http } from "@/lib/axiosInstance";
import type { FinishQuizAttemptRequest, SetAnswerRequest, StartQuizAttemptRequest, StartQuizAttemptResponse } from "@/types/client/quizzes";
import type { AxiosRequestConfig } from "axios";

export class ClientQuizzesService {
  // starts a quiz attempt or returns the active (only 1 concurrent attempt per user)
  static async startQuizAttempt(data: StartQuizAttemptRequest, config?: AxiosRequestConfig) {
    const response = await http.post<StartQuizAttemptResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/quizzes/attempt/${data.lectureSlug}`,
      undefined,
      config
    )
    return response.data
  }

  // creates or updates the answer of the question of the current attempt
  static async setAnswer(data: SetAnswerRequest, config?: AxiosRequestConfig) {
    const { lectureSlug, questionId, kind, answer } = data

    await http.post(
      `${import.meta.env.VITE_D_SERVICE_URL}/quizzes/attempt/${lectureSlug}/answer/${questionId}`,
      { kind, answer },
      config
    )
  }

  static async finishQuizAttempt(data: FinishQuizAttemptRequest, config?: AxiosRequestConfig) {
    await http.post(
      `${import.meta.env.VITE_D_SERVICE_URL}/quizzes/attempt/${data.lectureSlug}/finish`,
      undefined,
      config
    )
  }
}
