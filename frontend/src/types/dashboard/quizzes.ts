import type { QuizQuestionStatus } from "../common/quizzesQuestions"
import type { QuestionKindOptionsMap } from "./quizzesQuestions"

// REQUEST
export interface CreateQuizRequest {
  timeLimitSecs?: number | null
  passingScorePercentage: number
  shuffleQuestions: boolean
  showCorrectAnswers: boolean
  courseId: number
  title: string
}

export interface GetQuizzesRequest {
  courseId: number
  q: string | null
  sortBy: 'date' | 'title' | 'timeLimit' | 'passingScore'
  sortOrder: 'asc' | 'desc'
}

export interface GetQuizDetailsRequest {
  courseId: number
  quizId: number
}

export interface DeleteQuizRequest {
  quizId: number
}

export interface UpdateQuizRequest {
  quizId: number
  timeLimitSecs?: number | null
  passingScorePercentage?: number
  shuffleQuestions?: boolean
  showCorrectAnswers?: boolean
  title?: string
}


//RESPONSE
export interface QuizResponse {
  id: number
  timeLimitSecs?: number
  title: string
  passingScorePercentage: number
  shuffleQuestions: boolean
  showCorrectAnswers: boolean
  createdAt: string
  questionsAmount: number
  publicQuestionsAmount: number
}

export interface QuizResponseExtended extends QuizResponse {
  questions: ExtendedQuizResponseQuestion[]
}

export type ExtendedQuizResponseQuestion = {
  id: number
  quizId: number
  position: number
  status: QuizQuestionStatus
  questionText: string
  explanation?: string
  points: number
  createdAt: string
} & (
  | { kind: 'BoolMultiple', options: QuestionKindOptionsMap['BoolMultiple'] }
  | { kind: 'BoolSingle', options: QuestionKindOptionsMap['BoolSingle'] }
  | { kind: 'TextMultiple', options: QuestionKindOptionsMap['TextMultiple'] }
  | { kind: 'TextSingle', options: QuestionKindOptionsMap['TextSingle'] }
  | { kind: 'Match', options: QuestionKindOptionsMap['Match'] }
  | { kind: 'Ordering', options: QuestionKindOptionsMap['Ordering'] }
)