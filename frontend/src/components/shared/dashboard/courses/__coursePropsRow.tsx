import { TableCell, TableRow } from "@/components/ui/table"
import { CoursePropsActions } from "./coursePropsActions"
import type { CourseResponse } from "@/types/dashboard/courses"
import { ImageOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { CourseRoleBadge } from "@/components/shared/coursesUtils/courseRole"
import { CourseVisibilityBadge } from "@/components/shared/coursesUtils/courseVisibility"
import { CourseLectureAccesibilityBadge } from "../../coursesUtils/courseLectureAccesibility"

interface CoursePropsRowProps {
  course: CourseResponse
}

export const CoursePropsRow = ({ course }: CoursePropsRowProps) => {
  const navigate = useNavigate()

  return (
    <TableRow key={course.id}>
      <TableCell className="max-w-xs" onClick={() => navigate(`/dashboard/courses/${course.id}`)}>
        <div className="flex items-center truncate">
          {course.poster ? (
            <img
              className="w-8 h-8 rounded object-cover mr-3"
              src={course.poster}
              alt="course poster"
            />
          ) : (
            <div className="w-8 h-8 mr-3">
              <ImageOff className="w-8 h-8" />
            </div>
          )}

          <div className="space-y-0.5">
            <p className="font-medium">{course.title}</p>
            <p className="text-xs text-muted-foreground">
              {course.description}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell onClick={() => navigate(`/dashboard/courses/${course.id}`)}>
        <CourseVisibilityBadge visibility={course.visibility} variant="secondary"/>
      </TableCell>

      <TableCell onClick={() => navigate(`/dashboard/courses/${course.id}`)}>
        <CourseLectureAccesibilityBadge accesibility={course.lectureAccesibility} variant="secondary"/>
      </TableCell>

      <TableCell onClick={() => navigate(`/dashboard/courses/${course.id}`)}>
        <CourseRoleBadge role={course.role} variant="secondary"/>
      </TableCell>

      <TableCell onClick={() => navigate(`/dashboard/courses/${course.id}`)}>
        <span className="tabular-nums">{course.lecturesAmmount}</span>
      </TableCell>

      <TableCell onClick={() => navigate(`/dashboard/courses/${course.id}`)}>
        <span className="text-xs text-muted-foreground">
          {new Date(course.updatedAt).toLocaleDateString()}
        </span>
      </TableCell>
      
      <TableCell className="text-right">
        <CoursePropsActions course={course} />
      </TableCell>
    </TableRow>
  )
}