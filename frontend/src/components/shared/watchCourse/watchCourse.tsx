import type { WatchCourseResponse } from "@/types/client/courses"
import { WatchCourseHeader } from "./watchCourseHeader"
import { WatchCourseContent } from "./watchCourseContent"
import { WatchCourseActions } from "./watchCourseActions"
import { WatchCourseTabs } from "./watchCourseTabs"
import { useId } from "react"

interface WatchCoursePageProps {
  course: WatchCourseResponse
}

export function WatchCoursePage({ course }: WatchCoursePageProps) {
  const overview = useId()
  const content = useId()
  const reviews = useId() //not used
  const tabs = [
    { id: overview, label: "Descripción general" },
    { id: content, label: "Contenido del curso" },
    { id: reviews, label: "Reseñas" },
  ]

  return (
    <div>
      <WatchCourseHeader course={course} id={overview} />
      <WatchCourseTabs tabsConfig={tabs} defaultTab={tabs[0].id}/>
      
      <div className="p-8">
        <div className="flex gap-8 max-w-350 mx-auto">
          <div className="flex-1">
            <WatchCourseContent course={course} id={content}/>
          </div>
        
          <WatchCourseActions course={course} />
        </div>
      </div>
    </div>
  );
}