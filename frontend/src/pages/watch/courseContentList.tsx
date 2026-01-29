// components/course-content-list.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { WatchCourseSectionResponse } from "@/types/client/courses";

interface CourseContentListProps {
  sections: WatchCourseSectionResponse[];
  onLectureClick?: (lectureSlug: string) => void;
}

export function CourseContentList({ sections, onLectureClick }: CourseContentListProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0]) // Expandir la primera sección por defecto
  );

  const toggleSection = (position: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(position)) {
      newExpanded.delete(position);
    } else {
      newExpanded.add(position);
    }
    setExpandedSections(newExpanded);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <div key={section.slug} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection(section.position)}
            className="w-full p-4 bg-muted/50 hover:bg-muted flex items-center justify-between text-left"
          >
            <div>
              <h3 className="font-semibold">{section.title}</h3>
              <p className="text-sm text-muted-foreground">
                {section.lectures.length} lecciones
              </p>
            </div>
            {expandedSections.has(section.position) ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>

          {expandedSections.has(section.position) && (
            <div className="p-2">
              {section.lectures.map((lecture) => (
                <div
                  key={lecture.slug}
                  className={cn(
                    "p-3 rounded-md hover:bg-accent flex items-center justify-between cursor-pointer",
                    lecture.seen && "bg-green-50 dark:bg-green-950/20"
                  )}
                  onClick={() => onLectureClick?.(lecture.slug)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        lecture.seen
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                          : "bg-muted"
                      )}
                    >
                      {lecture.position}
                    </div>
                    <div>
                      <h4 className="font-medium">{lecture.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{lecture.kind}</span>
                        <span>•</span>
                        <span>{formatDuration(lecture.estimatedDurationSecs)}</span>
                        {lecture.seen && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 dark:text-green-400">
                              Completado
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}