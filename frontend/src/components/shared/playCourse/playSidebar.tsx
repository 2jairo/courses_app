import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { calculateProgress } from "@/lib/format"
import { PlaySidebarSection } from "./playSidebarSection"
import type { WatchCourseLectureResponse, WatchCourseResponse, WatchCourseSectionResponse } from "@/types/client/courses"

interface PlaySidebarProps {
  course: WatchCourseResponse
  currentLectureSlug?: string
  onLectureSelect?: (lecture: WatchCourseLectureResponse, section: WatchCourseSectionResponse) => void
}

export function PlaySidebar({ 
  course, 
  currentLectureSlug,
  onLectureSelect 
}: PlaySidebarProps) {
  const progress = calculateProgress(course.completedLectures, course.lecturesAmmount)

  // Find which section contains the current lecture
  const currentSectionIndex = course.sections
    .sort((a, b) => a.position - b.position)
    .findIndex(section => section.lectures.some(l => l.slug === currentLectureSlug))

  return (
    <aside className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold text-foreground line-clamp-2">
          {course.title}
        </h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tu progreso</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {course.completedLectures} de {course.lecturesAmmount} completadas
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {course.sections
            .sort((a, b) => a.position - b.position)
            .map((section, index) => (
              <PlaySidebarSection
                key={section.slug}
                section={section}
                courseSlug={course.slug}
                currentLectureSlug={currentLectureSlug}
                defaultOpen={index === currentSectionIndex || index === 0}
                sectionNumber={index + 1}
                onLectureSelect={(lecture) => onLectureSelect?.(lecture, section)}
              />
            ))
          }
        </div>
      </ScrollArea>
    </aside>
  )
}
