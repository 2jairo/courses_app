import { useParams } from "react-router-dom"
import { useWatchCourseQuery } from "@/queries/client/courses/useWatchCourseQuery"
import { WatchCoursePage } from "@/components/shared/watchCourse/watchCourse"
import { UserContext } from "@/context/user/createUserContext"
import { useContext } from "react"

export default function WatchPage() {
  const { user } = useContext(UserContext)
  const { courseSlug } = useParams()
  const courseQuery = useWatchCourseQuery({ courseSlug: courseSlug! })

  return (
    <>
      {courseQuery.data && (
        <WatchCoursePage course={courseQuery.data} currentUser={user} />
      )}
    </>
  )
}
