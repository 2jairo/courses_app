import { useState } from "react"
import { ChevronDown, Lock, Check, Clock, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDuration, formatLectureKind } from "@/lib/format"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { WatchCourseLectureResponse, WatchCourseSectionResponse } from "@/types/client/courses"
import { LectureKindIcon } from "../lecturesUtils/lectureKindIcon"

interface PlayLeftSidebarSectionProps {
  section: WatchCourseSectionResponse
  courseSlug: string
  currentLectureSlug?: string
  defaultOpen?: boolean
  sectionNumber: number
  onLectureSelect?: (lecture: WatchCourseLectureResponse) => void
}

export function PlayLeftSidebarSection({
  section,
  courseSlug,
  currentLectureSlug,
  defaultOpen = false,
  sectionNumber,
  onLectureSelect,
}: PlayLeftSidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const completedCount = section.lectures.filter(l => l.seen).length
  const totalDuration = section.lectures.reduce(
    (acc, l) => acc + l.estimatedDurationSecs,
    0
  )

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-1">
      <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-semibold text-secondary-foreground">
          {sectionNumber}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground line-clamp-1">
            {section.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {completedCount}/{section.lectures.length} lecciones
            {' · '}
            {formatDuration(totalDuration)}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="ml-5 border-l border-border pl-4 py-1">
          {section.lectures
            .sort((a, b) => a.position - b.position)
            .map((lecture) => (
              <LectureItem
                key={lecture.slug}
                lecture={lecture}
                courseSlug={courseSlug}
                isActive={lecture.slug === currentLectureSlug}
                onSelect={onLectureSelect}
              />
            ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

interface LectureItemProps {
  lecture: WatchCourseLectureResponse
  courseSlug: string
  isActive?: boolean
  onSelect?: (lecture: WatchCourseLectureResponse) => void
}

function LectureItem({ lecture, courseSlug, isActive = false, onSelect }: LectureItemProps) {
  const isLocked = lecture.visibility === "Private" || lecture.isBlocked
  const hasAssets = lecture.assets && lecture.assets.length > 0

  const content = (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg p-2.5 transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : isLocked
            ? "opacity-60 cursor-not-allowed"
            : "hover:bg-accent cursor-pointer"
      )}
    >
      {/* Status Icon */}
      <div
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          lecture.seen
            ? "bg-primary text-primary-foreground"
            : isActive
              ? "bg-primary/20 text-primary"
              : "bg-secondary text-secondary-foreground"
        )}
      >
        {lecture.seen ? (
          <Check className="h-4 w-4" />
        ) : isLocked ? (
          <Lock className="h-4 w-4" />
        ) : (
          <LectureKindIcon lectureKind={lecture.kind} className="h-4 w-4"/>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm line-clamp-2",
            isActive ? "font-medium text-primary" : "text-foreground"
          )}
        >
          {lecture.title}
        </p>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <Badge
            variant="secondary"
            className="h-5 px-1.5 font-normal"
          >
            {formatLectureKind(lecture.kind)}
          </Badge>
          {lecture.estimatedDurationSecs > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDuration(lecture.estimatedDurationSecs)}
            </span>
          )}
          {hasAssets && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="h-3 w-3" />
              {lecture.assets.length}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  if (isLocked) {
    return content
  }

  return (
    <Link 
      to={`/play/${courseSlug}/${lecture.slug}`}
      onClick={() => onSelect?.(lecture)}
    >
      {content}
    </Link>
  )
}
