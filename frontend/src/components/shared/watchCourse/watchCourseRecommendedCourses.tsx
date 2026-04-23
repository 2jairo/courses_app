import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

import type { WatchCourseResponse } from "@/types/client/courses"
import { useCourseRecommendationsQuery } from "@/queries/client/search/useCourseRecommendationsQuery"
import { CourseCard } from "@/components/shared/course/courseCard"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"

interface WatchCourseRecommendedCoursesParams {
  course: WatchCourseResponse
  id: string
}

export const WatchCourseRecommendedCourses = ({ course, id }: WatchCourseRecommendedCoursesParams) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useCourseRecommendationsQuery({ courseId: course.id }, { enabled: hasBeenVisible })

  const observerTarget = useInfiniteScroll({ fetchNextPage, isFetchingNextPage, hasNextPage })

  const courses = data?.pages.flat() ?? []

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div id={id} ref={containerRef} className="relative">
      <h3 className="text-xl font-bold tracking-tight mb-4">Cursos recomendados</h3>
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {courses.map((recommendedCourse) => (
            <CarouselItem key={recommendedCourse.id} className="pl-4 basis-auto">
              <div className="w-70 shrink-0 flex flex-col">
                <CourseCard course={recommendedCourse} viewSource="Recommendation" scrollToTop />
              </div>
            </CarouselItem>
          ))}
          
          {/* Intersection observer target for infinite scroll horizontally */}
          <CarouselItem className="pl-4 basis-auto">
            <div ref={observerTarget} className="w-2 shrink-0 self-stretch" />
          </CarouselItem>

          {/* Loading indicator for next page horizontally */}
          {isFetchingNextPage && (
            <CarouselItem className="pl-4 basis-auto flex items-center justify-center min-w-38 shrink-0">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CarouselItem>
          )}
        </CarouselContent>
        
        <div className="hidden sm:block">
          <CarouselPrevious className="absolute -left-4 z-999 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute -right-4 z-999 top-1/2 -translate-y-1/2" />
        </div>
      </Carousel>
    </div>
  )
}
