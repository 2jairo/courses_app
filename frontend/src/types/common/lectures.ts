export const LECTURE_VISIBILITY = ['Public', 'Link', 'Private'] as const
export type LectureVisibility = typeof LECTURE_VISIBILITY[number];

export const LECTURE_KIND = ['Video', 'Document', 'Quiz', 'Lab'] as const
export type LectureKind = typeof LECTURE_KIND[number];
