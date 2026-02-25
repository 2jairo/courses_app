export const QUIZ_QUESTION_KIND = ["BoolMultiple", "BoolSingle", "TextMultiple", "TextSingle", "Match", "Ordering"] as const
export type QuizQuestionKind = typeof QUIZ_QUESTION_KIND[number];

export const QUIZ_QUESTION_STATUS = ["Public", "Private"] as const
export type QuizQuestionStatus = typeof QUIZ_QUESTION_STATUS[number];
