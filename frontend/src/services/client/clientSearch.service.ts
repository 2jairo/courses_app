import { http } from "@/lib/axiosInstance"
import { objectToParams } from "@/lib/objectToParams"
import type { 
  SearchCoursesRequest, 
  SearchCoursesAutocompleteRequest, 
  GetCourseRecommendationsRequest,
  SearchCoursesAutocompleteResponse,
  SearchCoursesResponse,
  GetFilterSuggestionsRequest,
  GetFilterSuggestionsResponse,
  SearchCoursesCourseResponse
} from "@/types/client/search"
import type { Pagination } from "@/types/pagination"
import type { AxiosRequestConfig } from "axios"

export class ClientSearchService {
  static async searchCourses(query: SearchCoursesRequest & Pagination, config?: AxiosRequestConfig) {
    const params = objectToParams(query).toString()

    const response = await http.get<SearchCoursesResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/search?${params}`,
      { ...config }
    )
    return response.data
  }

  static async searchCoursesAutocomplete(query: SearchCoursesAutocompleteRequest, config?: AxiosRequestConfig) {
    const params = objectToParams(query).toString()

    const response = await http.get<SearchCoursesAutocompleteResponse>(
      `${import.meta.env.VITE_D_SERVICE_URL}/search/autocomplete?${params}`,
      { ...config }
    )
    return response.data
  }

  static async getCourseRecommendations({ courseId, ...pagination }: GetCourseRecommendationsRequest & Pagination, config?: AxiosRequestConfig) {
    const params = objectToParams(pagination).toString()
    
    const response = await http.get<SearchCoursesCourseResponse[]>(
      `${import.meta.env.VITE_D_SERVICE_URL}/search/recommendations/${courseId}?${params}`,
      { ...config }
    )
    return response.data
  }

  static async getFilterSuggestions(query: GetFilterSuggestionsRequest, config?: AxiosRequestConfig) {
    const params = objectToParams(query).toString()

    const response = await http.get<GetFilterSuggestionsResponse[]>(
      `${import.meta.env.VITE_D_SERVICE_URL}/search/suggestions?${params}`,
      { ...config }
    )
    return response.data
  }

  static async getTopCourses(config?: AxiosRequestConfig) {
    const response = await http.get<SearchCoursesCourseResponse[]>(
      `${import.meta.env.VITE_D_SERVICE_URL}/search/top-courses`,
      { ...config }
    )
    return response.data
  }
}
