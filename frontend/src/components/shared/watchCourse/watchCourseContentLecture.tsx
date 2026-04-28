import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WatchCourseLectureResponse, WatchCourseResponse } from "@/types/client/courses";
import { Lock, Paperclip } from "lucide-react";
import { LectureKindIcon } from "../lecturesUtils/lectureKindIcon";
import { Link } from "react-router-dom";

export interface WatchCourseContentLectureProps {
  lecture: WatchCourseLectureResponse
  course: WatchCourseResponse
}

export const WatchCourseContentLecture = ({ lecture, course }: WatchCourseContentLectureProps) => {
  return (
    <li
      key={lecture.slug}
      className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted/30 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <LectureKindIcon lectureKind={lecture.kind} className={cn(
          "h-4 w-4 shrink-0",
          lecture.seen ? "text-primary" : "text-muted-foreground"
        )}/>

        <span className={cn(
          "text-sm",
          lecture.seen ? "text-primary" : "text-foreground"
        )}>
          {lecture.title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {lecture.assets && lecture.assets.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Paperclip className="h-3 w-3" />
            {lecture.assets.length}
          </span>
        )}

        {(lecture.isBlocked || lecture.visibility == "Private") ? (
          <Lock className="h-3 w-3 text-muted-foreground" />
        ) : (
          <Link to={`/play/${course.slug}/${lecture.slug}`}>
            <span className="text-xs font-medium text-blue-600 underline underline-offset-2 cursor-pointer hover:text-blue-800 whitespace-nowrap">
              Ver lección
            </span>
          </Link>
        )}
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDuration(lecture.estimatedDurationSecs)}
        </span>
      </div>
    </li>
  )
} 