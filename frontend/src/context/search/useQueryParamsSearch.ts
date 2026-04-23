import { useQueryParams } from "@/hooks/useQueryParams"
import type { SearchCoursesRequest } from "@/types/client/search"
import type { CourseLecturesAccesibility } from "@/types/common/courses"
import type { SearchMode } from "@/types/common/search"

export const useQueryParamsSearch = () => {
  return useQueryParams<SearchCoursesRequest & { originalQ?: string }>({
    defaultValues: {
      mode: "fts",
      q: ""
    },
    parseParams: (params) => {
      const mode = (params.get("mode") as SearchMode) || "fts"
      const q = params.get("q") || ""
      const lectureAccesibility = params.getAll("lectureAccesibility") as CourseLecturesAccesibility[]
      const language = params.getAll("language")
      const tags = params.getAll("tags")
      const author = params.getAll("author")
      const minDiscountedPrice = params.get("minDiscountedPrice") ? Number(params.get("minDiscountedPrice")) / 100 : undefined
      const maxDiscountedPrice = params.get("maxDiscountedPrice") ? Number(params.get("maxDiscountedPrice")) / 100 : undefined
      const minAvgRating = params.get("minAvgRating") ? Number(params.get("minAvgRating")) : undefined
      const sortOrder = (params.get("sortOrder") as "asc" | "desc") || undefined
      const sortBy = params.get("sortBy") || undefined
      const originalQ = params.get("originalQ") || undefined

      return {
        mode,
        q,
        ...(lectureAccesibility.length > 0 && { lectureAccesibility }),
        ...(language.length > 0 && { language }),
        ...(tags.length > 0 && { tags }),
        ...(author.length > 0 && { author }),
        minDiscountedPrice,
        maxDiscountedPrice,
        minAvgRating,
        sortOrder,
        sortBy,
        originalQ,
      }
    },
    setParams: (values) => {
      const params = new URLSearchParams()
      if (values.mode) params.set("mode", values.mode)
      if (values.q) params.set("q", values.q)

      values.lectureAccesibility?.forEach(v => params.append("lectureAccesibility", v))
      values.language?.forEach(v => params.append("language", v))
      values.tags?.forEach(v => params.append("tags", v))
      values.author?.forEach(v => params.append("author", v))

      if (values.minDiscountedPrice !== undefined) params.set("minDiscountedPrice", (values.minDiscountedPrice * 100).toString())
      if (values.maxDiscountedPrice !== undefined) params.set("maxDiscountedPrice", (values.maxDiscountedPrice * 100).toString())
      if (values.minAvgRating !== undefined) params.set("minAvgRating", values.minAvgRating.toString())
      if (values.sortOrder) params.set("sortOrder", values.sortOrder)
      if (values.sortBy) params.set("sortBy", values.sortBy)
      if (values.originalQ) params.set("originalQ", values.originalQ)

      return params
    }
  })
}