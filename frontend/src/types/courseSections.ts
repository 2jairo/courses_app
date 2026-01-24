// REQUEST
export interface CreateCourseSectionRequest {
  courseId: number
  title: string
}

export interface DeleteCourseSectionRequest {
  sectionId: number
}

export interface UpdateCourseSectionRequest {
  sectionId: number
  title?: string
}

export interface UpdateCourseSectionPositionRequest {
  sectionId: number
  position: number
  courseId: number
}


// RESPONSE
export interface CourseSectionResponse {
  id: number
  slug: string
  position: number
  title: string
}