import { useParams } from "react-router-dom"
import { useWatchCourseQuery } from "@/queries/client/courses/useWatchCourseQuery"
import { WatchCoursePage } from "@/components/shared/watchCourse/watchCourse"


export default function WatchPage() {
  const { courseSlug } = useParams()
  const courseQuery = useWatchCourseQuery({ courseSlug: courseSlug! })

  return (
    <>
      {courseQuery.data && (
        <WatchCoursePage course={courseQuery.data}/>
      )}
    </>
  )
}
