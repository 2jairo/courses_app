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
  choices: string[]
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

export interface GetLastQuizAttemptResultRequest {
  attemptId: number
}

// RESPONSE
export interface StartQuizAttemptResponse {
  attemptId: number
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


export interface GetQuizAttemptDetailsResponse {
  id: number
  pointsEarned: number
  maxPoints: number
  scorePercentage: number
  passingScorePercentage: number
  passed: boolean
  completedAt: string | null
  createdAt: string
  questions: GetQuizAttemptDetailsResponseQuestion[]
}

export type GetQuizAttemptDetailsResponseQuestion = {
  id: number
  position: number
  questionText: string
  kind: string
  maxPoints: number
  pointsEarned: number
  explanation: string | null
} & (
  | { kind: 'BoolMultiple'; answer?: SetAnswerRequestAnswer['BoolMultiple']; correction: GetQuizAttemptDetailsResponseCorrectionBoolMultiple }
  | { kind: 'BoolSingle'; answer?: SetAnswerRequestAnswer['BoolSingle']; correction: GetQuizAttemptDetailsResponseCorrectionBoolSingle }
  | { kind: 'TextMultiple'; answer?: SetAnswerRequestAnswer['TextMultiple']; correction: GetQuizAttemptDetailsResponseCorrectionTextMultiple }
  | { kind: 'TextSingle'; answer?: SetAnswerRequestAnswer['TextSingle']; correction: GetQuizAttemptDetailsResponseCorrectionTextSingle }
  | { kind: 'Match'; answer?: SetAnswerRequestAnswer['Match']; correction: GetQuizAttemptDetailsResponseCorrectionMatch }
  | { kind: 'Ordering'; answer?: SetAnswerRequestAnswer['Ordering']; correction: GetQuizAttemptDetailsResponseCorrectionOrdering }
)

export interface GetQuizAttemptDetailsResponseCorrectionBoolMultiple {
  correctChoicesId: string[]
}
export interface GetQuizAttemptDetailsResponseCorrectionBoolSingle {
  correctChoiceId: string
}
export interface GetQuizAttemptDetailsResponseCorrectionTextMultiple {
  keywords: { 
    value: string,
    id: string
  }[]
}
export interface GetQuizAttemptDetailsResponseCorrectionTextSingle {
  correctAnswer: string
}
export interface GetQuizAttemptDetailsResponseCorrectionMatch {
  pairs: { 
    keyId: string,
    valueId: string
  }[]
}
export interface GetQuizAttemptDetailsResponseCorrectionOrdering {
  correctOrder: string[]
}

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