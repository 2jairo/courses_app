import { PlayCoursePage } from "@/components/shared/playCourse/playCourse"
import { useWatchCourseQuery } from "@/queries/client/courses/useWatchCourseQuery"
import { usePlayLectureQuery } from "@/queries/client/lectures/usePlayLectureQuery"
import { useParams } from "react-router-dom"

export default function PlayPage() {
  const { courseSlug, lectureSlug } = useParams()

  const courseQuery = useWatchCourseQuery({ courseSlug: courseSlug! })
  const lectureQuery = usePlayLectureQuery({ lectureSlug: lectureSlug! })

  return (
    <>
      {courseQuery.data && (
        <PlayCoursePage course={courseQuery.data} currentLecture={lectureQuery.data} />
      )}
    </>
  )
}