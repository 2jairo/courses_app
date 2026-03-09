import { CoursePropsActions } from "./coursePropsActions"
import type { CourseResponse } from "@/types/dashboard/courses"
import { ImageOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { CourseRoleBadge } from "@/components/shared/coursesUtils/courseRole"
import { CourseVisibilityBadge } from "@/components/shared/coursesUtils/courseVisibility"
import { CourseLectureAccesibilityBadge } from "../../coursesUtils/courseLectureAccesibility"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface CoursePropsCardProps {
  course: CourseResponse
}

export const CoursePropsCard = ({ course }: CoursePropsCardProps) => {
  const navigate = useNavigate()

  return (
    <Card className="flex flex-col overflow-hidden py-0 gap-0">
      {/* Poster */}
      <div
        className="relative h-36 bg-muted cursor-pointer shrink-0"
        onClick={() => navigate(`/dashboard/courses/${course.id}`)}
      >
        {course.poster ? (
          <img
            src={course.poster}
            alt="course poster"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
      </div>

      {/* Body */}
      <CardContent
        className="flex flex-1 flex-col gap-2 p-4! cursor-pointer"
        onClick={() => navigate(`/dashboard/courses/${course.id}`)}
      >
        <p className="font-semibold leading-snug line-clamp-2">{course.title}</p>
        {course.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
        )}

        <div className="mt-1 flex flex-wrap gap-1.5">
          <CourseVisibilityBadge visibility={course.visibility} variant="secondary" />
          <CourseLectureAccesibilityBadge accesibility={course.lectureAccesibility} variant="secondary" />
          <CourseRoleBadge role={course.role} variant="secondary" />
        </div>

        <p className="text-xs text-muted-foreground mt-auto pt-2">
          {course.lecturesAmmount} lección{course.lecturesAmmount !== 1 ? "es" : ""} ·{" "}
          Actualizado {new Date(course.updatedAt).toLocaleDateString()}
        </p>
      </CardContent>

      {/* Actions */}
      <CardFooter className="justify-end border-t p-4!">
        <CoursePropsActions course={course} />
      </CardFooter>
    </Card>
  )
}
