import type { GetCourseAnalyticsCompactResponse } from "@/types/dashboard/analytics"
import type { CourseResponseExtended } from "@/types/dashboard/courses"

import { AnalyticsDailyViewsAndImpressionsChart } from "./analyticsDailyViewsAndImpressionsChart"
import { AnalyticsLectureAnalyticsChart } from "./analyticsLectureAnalyticsChart"
import { AnalyticsSearchQueriesTables } from "./analyticsSearchQueriesTables"
import { AnalyticsUniqueViewsPerWeekChart } from "./analyticsUniqueViewsPerWeekChart"
import { AnalyticsViewsByAgeRangeChart } from "./analyticsViewsByAgeRangeChart"
import { AnalyticsViewsByDeviceChart } from "./analyticsViewsByDeviceChart"
import { AnalyticsViewsByTrafficSourceChart } from "./analyticsViewsByTrafficSourceChart"
import { AnalyticsViewsByViewerSexChart } from "./analyticsViewsByViewerSexChart"

interface AnalyticsChartsProps {
  analytics: GetCourseAnalyticsCompactResponse
  course?: CourseResponseExtended
}

export const AnalyticsCharts = ({ analytics, course }: AnalyticsChartsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <AnalyticsUniqueViewsPerWeekChart data={analytics.uniqueViewsPerWeek} totalUniqueViewers={analytics.stats.totalUniqueViewers} />
      <AnalyticsDailyViewsAndImpressionsChart data={analytics.dailyViewsAndImpressions} />
      <AnalyticsViewsByTrafficSourceChart data={analytics.viewsByTrafficSource} totalViews={analytics.stats.totalViews} />
      <AnalyticsViewsByViewerSexChart data={analytics.viewsByViewerSex} totalViews={analytics.stats.totalViews} />
      <AnalyticsViewsByAgeRangeChart data={analytics.viewsByAgeRange} totalViews={analytics.stats.totalViews} />
      <AnalyticsViewsByDeviceChart data={analytics.viewsByDevice} totalViews={analytics.stats.totalViews} />
      <div className="xl:col-span-2">
        <AnalyticsLectureAnalyticsChart data={analytics.lectureAnalytics} course={course} />
      </div>
      <AnalyticsSearchQueriesTables
        data={{
          searchQueries: analytics.searchQueries,
          searchQueriesRecent: analytics.searchQueriesRecent,
        }}
      />
    </div>
  )
}
