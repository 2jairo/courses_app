import { useQuery } from "react-query"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"

import { ClientLecturesService } from "@/services/client/clientLectures.service"
import type { PlayLectureRequest, PlayLectureResponse } from "@/types/client/lectures"
import type { LocalErrorResponse } from "@/types/error"
import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"

export const PLAY_LECTURE_QUERY_KEY = "play_lecture"

export const getPlayLectureQueryKey = (data: PlayLectureRequest) => {
	return [PLAY_LECTURE_QUERY_KEY, data] as const
}

export const usePlayLectureQuery = (data: PlayLectureRequest) => {
	const navigate = useNavigate()

	return useQuery<PlayLectureResponse, AxiosError<LocalErrorResponse>>({
		queryKey: getPlayLectureQueryKey(data),
		queryFn: ({ signal }) => ClientLecturesService.getPlayLecture(data, { signal }),
		onError: (e) => queryOrMutationDefaultOnError(e, navigate),
		enabled: !!data.lectureSlug,
	})
}