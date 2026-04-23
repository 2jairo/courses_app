import type { WatchCourseResponse } from "@/types/client/courses"
import { WatchCourseHeader } from "./watchCourseHeader"
import { WatchCourseContent } from "./watchCourseContent"
import { WatchCourseActions } from "./watchCourseActions"
import { WatchCourseTabs } from "./watchCourseTabs"
import { useId } from "react"
import { WatchCourseReviews } from "./watchCourseReviews"
import type { UserAuthServiceUserProfileResponse } from "@/types/client/auth"
import type { AnalyticsViewSource } from "@/types/common/analytics"
import { WatchCourseRecommendedCourses } from "./watchCourseRecommendedCourses"

interface WatchCoursePageProps {
  course: WatchCourseResponse
  currentUser: UserAuthServiceUserProfileResponse | null
  viewSource: AnalyticsViewSource
}

export function WatchCoursePage({ course, currentUser, viewSource }: WatchCoursePageProps) {
  const tabs = {
    overview: { id: useId(), label: "Descripción general" },
    content: { id: useId(), label: "Contenido del curso" },
    reviews: { id: useId(), label: "Reseñas" },
    actions: { id: useId(), label: "Acciones", onlyOnMobile: true },
    recommendations: { id: useId(), label: "Cursos recomendados", },
  }

  const scrollToSection = (key: string) => {
    const element = document.getElementById(key)
    if (element) {
      const offset = 80
      const top = element.offsetTop - offset
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  return (
    <div>
      <WatchCourseHeader course={course} id={tabs.overview.id} currentUser={currentUser} />
      <WatchCourseTabs tabsConfig={tabs} defaultTab={tabs.overview.id} scrollToSection={scrollToSection} />
      
      <div className="p-8">
        <div className="flex gap-8 max-w-350 mx-auto flex-col md:flex-row">
          <div className="flex-1 flex flex-col gap-8 min-w-0">
            <WatchCourseContent course={course} id={tabs.content.id} currentUser={currentUser} />
            <WatchCourseReviews course={course} id={tabs.reviews.id} currentUser={currentUser} />
            <WatchCourseRecommendedCourses course={course} id={tabs.recommendations.id} />
          </div>

          <WatchCourseActions 
            viewSource={viewSource}
            course={course}
            id={tabs.actions.id}
            currentUser={currentUser}
            scrollToReviews={() => scrollToSection(tabs.reviews.id)}
          />
        </div>
      </div>
    </div>
  );
}