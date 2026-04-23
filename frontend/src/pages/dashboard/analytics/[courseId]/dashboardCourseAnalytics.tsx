import { AnalyticsCharts } from "@/components/shared/dashboard/analytics/analyticsCharts"
import { AnalyticsCourseBasicInfo } from "@/components/shared/dashboard/analytics/analyticsCourseBasicInfo"
import { AnalyticsStatsCards } from "@/components/shared/dashboard/analytics/analyticsStatsCards"
import { CoursePropsActions } from "@/components/shared/dashboard/courses/coursePropsActions"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useValidId } from "@/hooks/useValidId"
import { useCourseAnalyticsQuery } from "@/queries/dashboard/analytics/useCourseAnalyticsQuery"
import { useCourseDetailsQuery } from "@/queries/dashboard/courses/useCourseDetailsQuery"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { setDocumentTitle } from "@/lib/documentTitle"

export default function DashboardCourseAnalytics() {
  const { courseId: courseIdStr } = useParams()
  const courseId = useValidId(courseIdStr!, "/dashboard/courses")
  const courseDetails = useCourseDetailsQuery({ courseId: courseId! })
  const analytics = useCourseAnalyticsQuery({ courseId: courseId! })
  
  useEffect(() => {
    setDocumentTitle(`Analytics: ${courseDetails.data?.title ||''}`)
  }, [courseDetails])
  
  if (!courseId) {
    return <Spinner />
  }

  return (
    <div>
      <div className="flex flex-1 flex-col gap-4 p-4 max-w-350 m-auto">
        {courseDetails.data && (
          <>
            <div className="flex justify-between">
              <h1>Acciones</h1>
              <CoursePropsActions course={courseDetails.data} disabledActions={['analytics', 'delete']} />
            </div>

            <AnalyticsCourseBasicInfo course={courseDetails.data} />
          </>
        )}
      </div>

      <Separator />

      <div className="flex flex-1 flex-col gap-4 p-4 max-w-350 m-auto">
        {analytics.isLoading && <Spinner />}
        {analytics.data && (
          <>
            <AnalyticsStatsCards stats={analytics.data.stats} />
            <AnalyticsCharts analytics={analytics.data} course={courseDetails.data} />
          </>
        )}
      </div>
    </div>
  )
}