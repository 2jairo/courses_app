import { http } from "@/lib/axiosInstance"
import type { AxiosRequestConfig } from "axios"
import type { GetTagsRequest, TagResponse } from "@/types/dashboard/courseTag"
import type { Pagination } from "@/types/pagination"
import { objectToParams } from "@/lib/objectToParams"

export class DashboardCourseTagsService {
	static async getTags(query: GetTagsRequest & Pagination, config?: AxiosRequestConfig) {
		const params = objectToParams(query).toString()

		const { data } = await http.get<TagResponse[]>(
			`${import.meta.env.VITE_A_SERVICE_URL}/course-tags?${params}`,
			config
		)
		return data
	}
}
