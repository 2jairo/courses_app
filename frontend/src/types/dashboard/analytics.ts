import type { DeviceType, UserSex } from "../client/auth"
import type { AnalyticsViewSource, CourseViewsAgeRange } from "../common/analytics"
import type { SearchMode } from "../common/search"

// REQUEST
export interface GetCourseAnalyticsRequest {
  courseId: number
}

// RESPONSE
export interface GetCourseAnalyticsStatsResponse {
  courseId: number
  avgRating: number
  totalReviews: number
  totalPurchases: number
  totalViews: number
  totalImpressions: number
  totalUniqueViewers: number
}

export type CompactTableRow<TFields extends readonly string[]> = {
  [K in keyof TFields]: unknown
}

export interface CompactTableResponse<
  TFields extends readonly string[] = readonly string[],
  TRow extends CompactTableRow<TFields> = CompactTableRow<TFields>
> {
  fields: TFields
  rows: TRow[]
}

export interface GetCourseAnalyticsCompactResponse {
  stats: GetCourseAnalyticsStatsResponse
  uniqueViewsPerWeek: CompactTableResponse<
    ["viewDate", "courseId", "uniqueUsers"],
    [string, number, number]
  >
  dailyViewsAndImpressions: CompactTableResponse<
    ["viewDate", "courseId", "impressions", "views"],
    [string, number, number, number]
  >
  viewsByTrafficSource: CompactTableResponse<
    ["viewSource", "views"],
    [AnalyticsViewSource, number]
  >
  viewsByViewerSex: CompactTableResponse<
    ["userSex", "views"],
    [UserSex | null, number]
  >
  viewsByAgeRange: CompactTableResponse<
    ["ageRange", "views"],
    [CourseViewsAgeRange | null, number]
  >
  viewsByDevice: CompactTableResponse<
    ["device", "views"],
    [DeviceType, number]
  >
  searchQueries: CompactTableResponse<
    ["query", "mode", "seen", "searchCount", "lastSearched"],
    [string, string, boolean, number, string]
  >
  searchQueriesRecent: CompactTableResponse<
    ["query", "mode", "seen", "count", "lastSearched"],
    [string, SearchMode, boolean, number, string]
  >
  lectureAnalytics: CompactTableResponse<
    ["lectureId", "views", "viewSeconds"],
    [number, number, number]
  >
}