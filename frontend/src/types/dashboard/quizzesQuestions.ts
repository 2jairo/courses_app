import type { QuizQuestionKind, QuizQuestionStatus } from "../common/quizzesQuestions"

// REQUEST
export type CreateQuestionRequest = {
  kind: QuizQuestionKind
  questionText: string
  explanation?: string | null
  status: QuizQuestionStatus
  points: number
  quizId: number
} & (
  | { kind: 'BoolMultiple', options: QuestionKindOptionsMap['BoolMultiple'] }
  | { kind: 'BoolSingle', options: QuestionKindOptionsMap['BoolSingle'] }
  | { kind: 'TextMultiple', options: QuestionKindOptionsMap['TextMultiple'] }
  | { kind: 'TextSingle', options: QuestionKindOptionsMap['TextSingle'] }
  | { kind: 'Match', options: QuestionKindOptionsMap['Match'] }
  | { kind: 'Ordering', options: QuestionKindOptionsMap['Ordering'] }
)

export type UpdateQuestionRequest = {
  kind: QuizQuestionKind
  questionText: string
  explanation?: string | null
  status: QuizQuestionStatus
  points: number
  questionId: number
} & (
  | { kind: 'BoolMultiple', options: QuestionKindOptionsMap['BoolMultiple'] }
  | { kind: 'BoolSingle', options: QuestionKindOptionsMap['BoolSingle'] }
  | { kind: 'TextMultiple', options: QuestionKindOptionsMap['TextMultiple'] }
  | { kind: 'TextSingle', options: QuestionKindOptionsMap['TextSingle'] }
  | { kind: 'Match', options: QuestionKindOptionsMap['Match'] }
  | { kind: 'Ordering', options: QuestionKindOptionsMap['Ordering'] }
)

export interface UpdateQuestionPositionRequest {
  questionId: number
  quizId: number
  position: number
}

export interface DeleteQuestionRequest {
  questionId: number
}

// RESPONSE
export type QuizQuestionResponse = {
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


export interface QuestionKindOptionsMap {
  BoolMultiple: CreateQuestionRequestKindBoolMultiple
  BoolSingle: CreateQuestionRequestKindBoolSingle
  TextMultiple: CreateQuestionRequestKindTextMultiple
  TextSingle: CreateQuestionRequestKindTextSingle
  Match: CreateQuestionRequestKindMatch
  Ordering: CreateQuestionRequestKindOrdering
}

export interface CreateQuestionRequestKindBoolMultiple {
  choices: {
    text: string,
    correct: boolean
  }[]
} 
export interface CreateQuestionRequestKindBoolSingle {
  choices: {
    text: string,
    correct: boolean
  }[]
} 
export interface CreateQuestionRequestKindTextMultiple {
  keywords: {
    value: string
  }[]
} 
export interface CreateQuestionRequestKindTextSingle {
  correctAnswer: string
} 
export interface CreateQuestionRequestKindMatch {
  pairs: {
    key: string,
    value: string
  }[]
}
export interface CreateQuestionRequestKindOrdering {
  items: {
    value: string
  }[]
}