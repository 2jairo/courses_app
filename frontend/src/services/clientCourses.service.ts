// src/services/CoursesService.ts
import { http } from "@/lib/axiosInstance";
import type { WatchCourseRequest, WatchCourseResponse } from "@/types/client/courses";

export class ClientCoursesService {
  static async watchCourse(data: WatchCourseRequest) {
    const response = await http.get<WatchCourseResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/courses/watch/${data.courseSlug}`
    )
    return response.data
  }

}