// REQUEST
 
export interface GetCourseGiftCodesRequest {
  orderId: number
  courseId: number
}

export interface RedeemGiftCodeRequest {
  code: string
}

// RESPONSE
export interface CourseGiftCodeResponse {
  code: string
  redeemedAt?: string | null
  redeemedBy?: {
    username: string
    avatar?: string | null
  } | null
}


export interface RedeemGiftCodeResponse {
  course: RedeemGiftCodeResponseCourse
}

export interface RedeemGiftCodeResponseCourse {
  slug: string
  title: string
  poster?: string | null
}