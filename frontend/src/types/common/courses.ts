export const COURSE_VISIBILITY = ['Private', 'Link', 'Public'] as const
export type CourseVisibility = typeof COURSE_VISIBILITY[number];

export const COURSE_LECTURES_ACCESIBILITY = ['Open', 'Section', 'QuizOrLab', 'Closed'] as const
export type CourseLecturesAccesibility = typeof COURSE_LECTURES_ACCESIBILITY[number];

export const COURSE_LANGUAGES = ['es','en','fr','de','it','pt','ru','zh','ja','ko'] as const
export type CourseLanguage = typeof COURSE_LANGUAGES[number];