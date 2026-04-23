import type { CourseLecturesAccesibility } from "../common/courses"
import type { FacetableFields, SearchMode, SortByFields } from "../common/search"
import type { Pagination } from "../pagination"

export interface SearchCoursesRequest {
  mode: SearchMode
  q: string
  lectureAccesibility?: CourseLecturesAccesibility[]
  language?: string[]
  tags?: string[]
  author?: string[]
  minDiscountedPrice?: number
  maxDiscountedPrice?: number
  minAvgRating?: number
  sortOrder?: "asc" | "desc"
  sortBy?: SortByFields
}

export interface GetCourseRecommendationsRequest {
  courseId: number
}

export interface SearchCoursesAutocompleteRequest {
  q: string
}

export interface GetFilterSuggestionsRequest {
  field: FacetableFields
  q: string
}

// RESPONSE
export interface SearchCoursesResponse {
  found: number
  courses: SearchCoursesCourseResponse[]
  filters: SearchCoursesFiltersResponse
}

export interface SearchCoursesCourseResponse {
  id: string
  slug: string
  updatedAt: number
  lectureAccesibility: CourseLecturesAccesibility
  title: string
  description: string
  poster: string
  language: string
  lecturesAmmount: number
  price: number
  discountPercent: number
  tags: string[]
  author: string
  avgRating: number
  totalReviews: number
  totalPurchases: number
}

export interface SearchCoursesFiltersResponse extends Pagination {
  mode: SearchMode
  originalQ?: string
  q?: string
  lectureAccesibility?: CourseLecturesAccesibility[]
  language?: string[]
  tags?: string[]
  author?: string[]
  minDiscountedPrice?: number
  maxDiscountedPrice?: number
  minAvgRating?: number
  sortOrder?: "asc" | "desc"
  sortBy?: SortByFields
}

export interface SearchCoursesAutocompleteResponse {
  popular: SearchCoursesAutocompleteItemResponse[] //max length = 10
  titles: SearchCoursesAutocompleteItemResponse[] // max length = 10
}
export interface SearchCoursesAutocompleteItemResponse {
  query: string
  mode: SearchMode
}


export interface GetFilterSuggestionsResponse {
  name: string
  count: number
}