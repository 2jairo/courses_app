import { PlayCoursePage } from "@/components/shared/playCourse/playCourse"
import { useQueryParams } from "@/hooks/useQueryParams"
import { useWatchCourseQuery } from "@/queries/client/courses/useWatchCourseQuery"
import { usePlayLectureQuery } from "@/queries/client/lectures/usePlayLectureQuery"
import { ANALYTICS_VIEW_SOURCE, type AnalyticsViewSource } from "@/types/common/analytics"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { setDocumentTitle } from "@/lib/documentTitle"

export default function PlayPage() {
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

  const { courseSlug, lectureSlug } = useParams()
  const courseQuery = useWatchCourseQuery({ payload: { courseSlug: courseSlug! }, viewSource: queryParams.viewSource })
  const lectureQuery = usePlayLectureQuery({ lectureSlug: lectureSlug! })

  useEffect(() => {
    setDocumentTitle(`Ver clase: ${lectureQuery.data?.title || ''}`)
  }, [lectureQuery])

  return (
    <>
      {courseQuery.data && (
        <PlayCoursePage 
          course={courseQuery.data} 
          currentLecture={lectureQuery.data}
          currentLectureLoading={lectureQuery.isLoading}
          currentLectureError={lectureQuery.error?.response?.data}
        />
      )}
    </>
  )
}