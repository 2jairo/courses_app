import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { discountedPrice } from "@/lib/discountedPrice"
import {
  formatCourseLectureAccesibility,
  formatCourseVisibility,
  formatLanguage,
  formatPrice,
  formatViews,
} from "@/lib/format"
import type { CourseResponseExtended } from "@/types/dashboard/courses"

interface AnalyticsCourseBasicInfoProps {
  course: CourseResponseExtended
}

export const AnalyticsCourseBasicInfo = ({ course }: AnalyticsCourseBasicInfoProps) => {
  const finalPrice = discountedPrice(course.price, course.discountPercent)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informacion basica del curso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xl font-semibold">{course.title}</p>
          <p className="text-sm text-muted-foreground">{course.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{formatLanguage(course.language)}</Badge>
          <Badge variant="outline">{formatCourseVisibility(course.visibility)}</Badge>
          <Badge variant="outline">{formatCourseLectureAccesibility(course.lectureAccesibility)}</Badge>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Precio</p>
            <p className="font-medium">{formatPrice(course.price, course.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Precio final</p>
            <p className="font-medium">{course.isFree ? "Gratis" : formatPrice(finalPrice, course.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Descuento</p>
            <p className="font-medium">{course.discountPercent}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lecciones</p>
            <p className="font-medium">{formatViews(course.lecturesAmmount)}</p>
          </div>
        </div>

        {course.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {course.tags.map((tag) => (
              <Badge key={tag.slug} variant="secondary" className="font-normal">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
