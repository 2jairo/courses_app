export const ANALYTICS_VIEW_SOURCE = ['Search', 'Recommendation', 'Direct', 'External', 'Category'] as const;
export type AnalyticsViewSource = typeof ANALYTICS_VIEW_SOURCE[number];

export const COURSE_VIEWS_AGE_RANGE = ['0-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'] as const;
export type CourseViewsAgeRange = typeof COURSE_VIEWS_AGE_RANGE[number];