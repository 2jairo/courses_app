"use client"

import { useState } from "react"
import { ChevronDown, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { WatchCourseResponse } from "@/types/client/courses"
import { formatDuration } from "@/lib/format"
import { LectureKindIcon } from "../lecturesUtils/lectureKindIcon"

interface WatchCourseContentProps {
  course: WatchCourseResponse
  id: string
}

export function WatchCourseContent({ course, id }: WatchCourseContentProps) {
  const [expandAll, setExpandAll] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>([])

  const totalDuration = course.sections.reduce(
    (acc, section) =>
      acc + section.lectures.reduce((l, lecture) => l + lecture.estimatedDurationSecs, 0),
    0
  )

  const toggleSection = (slug: string) => {
    setOpenSections((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  const toggleExpandAll = () => {
    if (expandAll) {
      setOpenSections([])
    } else {
      setOpenSections(course.sections.map((s) => s.slug))
    }
    setExpandAll(!expandAll)
  }

  return (
    <section className="scroll-mt-20 flex-1 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60" id={id}>
      <Card className="border-0 shadow-none gap-4">
        <CardHeader className="flex items-start justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">Contenido del curso</CardTitle>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {course.sections.length} secciones · {course.lecturesAmmount} lecciones · {formatDuration(totalDuration, true)}
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={toggleExpandAll}>
            {expandAll ? "Colapsar todo" : "Expandir todo"}
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-border rounded-md border border-border">
            {course.sections
              .sort((a, b) => a.position - b.position)
              .map((section) => {
                const sectionDuration = section.lectures.reduce(
                  (acc, l) => acc + l.estimatedDurationSecs,
                  0
                )
                const isOpen = openSections.includes(section.slug)

                return (
                  <Collapsible
                    key={section.slug}
                    open={isOpen}
                    onOpenChange={() => toggleSection(section.slug)}
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between bg-muted/40 px-4 py-3 text-left transition-colors hover:bg-muted/60">
                      <div className="flex items-center gap-2">
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                            isOpen && "rotate-180"
                          )}
                        />
                        <span className="font-medium text-foreground text-sm">{section.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {section.lectures.length} lecciones · {formatDuration(sectionDuration, true)}
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="divide-y divide-border">
                        {section.lectures
                          .sort((a, b) => a.position - b.position)
                          .map((lecture) => {

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
                                  {lecture.visibility === "Public" && !lecture.seen && (
                                    <span className="text-xs font-medium text-blue-600 underline underline-offset-2 cursor-pointer hover:text-blue-800">
                                      Vista previa
                                    </span>
                                  )}

                                  {lecture.visibility == "Private" && (
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                  )}
                                  <span className="text-xs text-muted-foreground tabular-nums">
                                    {formatDuration(lecture.estimatedDurationSecs)}
                                  </span>
                                </div>
                              </li>
                            )
                          })}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
