// REQUEST
export interface StartQuizAttemptRequest {
  lectureSlug: string
}

export type SetAnswerRequest = {
  lectureSlug: string
  questionId: number
} & (
  | { kind: 'BoolMultiple'; answer: SetAnswerRequestAnswer['BoolMultiple'] }
  | { kind: 'BoolSingle'; answer: SetAnswerRequestAnswer['BoolSingle'] }
  | { kind: 'TextMultiple'; answer: SetAnswerRequestAnswer['TextMultiple'] }
  | { kind: 'TextSingle'; answer: SetAnswerRequestAnswer['TextSingle'] }
  | { kind: 'Match'; answer: SetAnswerRequestAnswer['Match'] }
  | { kind: 'Ordering'; answer: SetAnswerRequestAnswer['Ordering'] }
)

export interface SetAnswerRequestAnswer {
  BoolMultiple: SetAnswerRequestAnswerBoolMultiple
  BoolSingle: SetAnswerRequestAnswerBoolSingle
  TextMultiple: SetAnswerRequestAnswerTextMultiple
  TextSingle: SetAnswerRequestAnswerTextSingle
  Match: SetAnswerRequestAnswerMatch
  Ordering: SetAnswerRequestAnswerOrdering
}

export interface SetAnswerRequestAnswerBoolMultiple {
  choicesId: string[]
}
export interface SetAnswerRequestAnswerBoolSingle {
  choiceId: string
}
export interface SetAnswerRequestAnswerTextMultiple {
  choicesId: string[]
}
export type SetAnswerRequestAnswerTextSingle = {
  choice: string
}
export interface SetAnswerRequestAnswerMatch {
  choices: {
    keyId: string
    valueId: string
  }[]
}
export interface SetAnswerRequestAnswerOrdering {
  choicesId: string[]
}

export interface FinishQuizAttemptRequest {
  lectureSlug: string
}

// RESPONSE
export interface StartQuizAttemptResponse {
  timeLimitSecs: number | null
  expiresAt: string | null
  passingScorePercentage: number
  showCorrectAnswers: boolean
  createdAt: string
  questionsAmount: number
  publicQuestionsAmount: number
  questions: StartQuizAttemptResponseQuestion[]
}

export type StartQuizAttemptResponseQuestion = {
  id: number
  position: number
  kind: string
  questionText: string
  points: number
} & (
  | { kind: 'BoolMultiple', options: StartQuizAttemptResponseOptions['BoolMultiple'], answer?: SetAnswerRequestAnswer['BoolMultiple'] }
  | { kind: 'BoolSingle', options: StartQuizAttemptResponseOptions['BoolSingle'], answer?: SetAnswerRequestAnswer['BoolSingle'] }
  | { kind: 'TextMultiple', options: StartQuizAttemptResponseOptions['TextMultiple'], answer?: SetAnswerRequestAnswer['TextMultiple'] }
  | { kind: 'TextSingle', options: StartQuizAttemptResponseOptions['TextSingle'], answer?: SetAnswerRequestAnswer['TextSingle'] }
  | { kind: 'Match', options: StartQuizAttemptResponseOptions['Match'], answer?: SetAnswerRequestAnswer['Match'] }
  | { kind: 'Ordering', options: StartQuizAttemptResponseOptions['Ordering'], answer?: SetAnswerRequestAnswer['Ordering'] }
)

export interface StartQuizAttemptResponseOptions {
  BoolMultiple: StartQuizAttemptResponseOptionBoolMultiple
  BoolSingle: StartQuizAttemptResponseOptionBoolSingle
  TextMultiple: StartQuizAttemptResponseOptionTextMultiple
  TextSingle: StartQuizAttemptResponseOptionTextSingle
  Match: StartQuizAttemptResponseOptionMatch
  Ordering: StartQuizAttemptResponseOptionOrdering
}

export interface StartQuizAttemptResponseOptionBoolMultiple {
  choices: { text: string; id: string }[]
}
export interface StartQuizAttemptResponseOptionBoolSingle {
  choices: { text: string; id: string }[]
}
export interface StartQuizAttemptResponseOptionTextMultiple {
  totalKeywords: number
}
export type StartQuizAttemptResponseOptionTextSingle = object
export interface StartQuizAttemptResponseOptionMatch {
  keys: { value: string; id: string }[]
  values: { value: string; id: string }[]
}
export interface StartQuizAttemptResponseOptionOrdering {
  items: { value: string; id: string }[]
}