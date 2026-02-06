import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WatchCourseLectureResponse } from "@/types/client/courses";
import { CheckCircle2, Clock, Lock } from "lucide-react";
import { LectureKindIcon } from "../lecturesUtils/lectureKindIcon";


export interface WatchCourseContentLectureProps {
  lecture: WatchCourseLectureResponse
} 

export const WatchCourseContentLecture = ({ lecture }: WatchCourseContentLectureProps) => {
  const isCompleted = lecture.seen;
  const isLocked = lecture.visibility === "Private";

  return (
    <AccordionItem
      key={lecture.slug}
      value={lecture.slug}
      className={cn(
        "border-x-0 border-b-0 border-t border-border",
        isCompleted && "bg-green-50/50 dark:bg-green-950/20"
      )}
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
        <div className="flex items-center gap-3 flex-1">
          <div className={cn("p-2 rounded-md transition-colors",
            isCompleted
              ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
              : isLocked
                ? "bg-muted text-muted-foreground"
                : "bg-muted text-foreground"
          )}>
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : isLocked ? (
              <Lock className="h-4 w-4" />
            ) : (
              <LectureKindIcon lectureKind={lecture.kind} className="h-4 w-4" />
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm text-foreground truncate">
                {lecture.title}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(lecture.estimatedDurationSecs)}
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Completado
                </span>
              )}
              {lecture.visibility === "Link" && (
                <span className="text-blue-600 dark:text-blue-400 font-medium underline underline-offset-2 cursor-pointer hover:text-blue-700">
                  Preview
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto mr-2">
          <Button variant="ghost" size="sm" disabled={isLocked} onClick={(e) => e.stopPropagation()}>
            {isCompleted ? "Volver a ver" : isLocked ? "Bloqueado" : "Ver lección"}
          </Button>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        {lecture.description && (
          <p className="text-sm text-muted-foreground">
            {lecture.description}
          </p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
} 