import { FavCourses } from "@/components/shared/fav-courses/favCourses"
import { setDocumentTitle } from "@/lib/documentTitle"
import { useEffect } from "react"

export default function FavCoursesPage() {
  useEffect(() => {
    setDocumentTitle("Favoritos", true)
  }, [])
  
  return (
    <div className="mx-auto w-full max-w-350">
      <FavCourses />
    </div>
  )
}