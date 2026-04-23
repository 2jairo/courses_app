import { useParams } from "react-router-dom"
import { useWatchCourseQuery } from "@/queries/client/courses/useWatchCourseQuery"
import { WatchCoursePage } from "@/components/shared/watchCourse/watchCourse"
import { UserContext } from "@/context/user/createUserContext"
import { useContext, useEffect } from "react"
import { useQueryParams } from "@/hooks/useQueryParams"
import { ANALYTICS_VIEW_SOURCE, type AnalyticsViewSource } from "@/types/common/analytics"
import { setDocumentTitle } from "@/lib/documentTitle"

export default function WatchPage() {
  const { queryParams } = useQueryParams({
    defaultValues: { viewSource: 'Direct' as AnalyticsViewSource },
    parseParams: (params) => {
      const viewSource = (params.get("viewSource") || "Direct") as AnalyticsViewSource

      return {
        viewSource: (ANALYTICS_VIEW_SOURCE.includes(viewSource) ? viewSource : "Direct")
      }
    },
    setParams: (values) => {
      const searchParams = new URLSearchParams()
      searchParams.set("viewSource", values.viewSource)
      return searchParams
    }
  })
  const { user } = useContext(UserContext)
  const { courseSlug } = useParams()
  const courseQuery = useWatchCourseQuery({ payload: { courseSlug: courseSlug! }, viewSource: queryParams.viewSource })

  useEffect(() => {
    setDocumentTitle(courseQuery.data ? courseQuery.data.title : "")
  }, [courseQuery])

  return (
    <>
      {courseQuery.data && (
        <WatchCoursePage course={courseQuery.data} currentUser={user} viewSource={queryParams.viewSource} />
      )}
    </>
  )
}
