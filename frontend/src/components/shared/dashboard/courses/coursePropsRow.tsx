import { TableCell, TableRow } from "@/components/ui/table"
import { CoursePropsActions } from "./coursePropsActions"
import type { CourseResponse } from "@/types/dashboard/courses"
import { formatCoursePermissionsRole, formatCourseVisibility, getCoursePermissionsRoleVariant, getCourseVisibilityVariant } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { ImageOff } from "lucide-react"
import { useNavigate } from "react-router-dom"

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
        <Badge variant={getCourseVisibilityVariant(course.visibility)}>
          {formatCourseVisibility(course.visibility)}
        </Badge>
      </TableCell>

      <TableCell onClick={() => navigate(`/dashboard/courses/${course.id}`)}>
        <Badge variant={getCoursePermissionsRoleVariant(course.role)}>
          {formatCoursePermissionsRole(course.role)}
        </Badge>
      </TableCell>

      <TableCell onClick={() => navigate(`/dashboard/courses/${course.id}`)}>
        <span className="tabular-nums">{course.lecturesAmmount}</span>
      </TableCell>

      <TableCell>
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