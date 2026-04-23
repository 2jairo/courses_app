import { ClientAnalyticsService } from "@/services/client/clientAnalytics.service"
import type { PlayLectureResponse } from "@/types/client/lectures"
import { useEffect, useRef } from "react"

export const useWatchLecture = (currentLecture?: PlayLectureResponse) => {
  const currentLectureId = useRef<number | null>(null)
	const secondsRef = useRef(0)
	const intervalRef = useRef<number | null>(null)
	const windowActiveRef = useRef(document.visibilityState === "visible" && document.hasFocus())

	const startTimer = () => {
    secondsRef.current = 0

		intervalRef.current = setInterval(() => {
			if (windowActiveRef.current) {
				secondsRef.current += 0.25
			}
		}, 250)
	}

	const stopTimer = () => {
    clearInterval(intervalRef.current!)
    intervalRef.current = null

    if(currentLectureId.current !== null && secondsRef.current > 0) {
      ClientAnalyticsService.trackLectureView({ lectureId: currentLectureId.current, viewSeconds: secondsRef.current })
    }
	}

	useEffect(() => {
		const handleVisibility = () => {
			windowActiveRef.current = document.visibilityState === "visible" && document.hasFocus()
		}
		const handleFocus = () => {
			windowActiveRef.current = true
		}
		const handleBlur = () => {
			windowActiveRef.current = false
		}

		document.addEventListener("visibilitychange", handleVisibility)
		window.addEventListener("focus", handleFocus)
		window.addEventListener("blur", handleBlur)
    
    // on component destroy
    return () => {
			document.removeEventListener("visibilitychange", handleVisibility)
			window.removeEventListener("focus", handleFocus)
			window.removeEventListener("blur", handleBlur)
			stopTimer()
		}
	}, [])


	useEffect(() => {
    if (!currentLecture) {
      stopTimer()
      currentLectureId.current = null
      return
    }

    if(currentLecture.id !== currentLectureId.current) {
      stopTimer()
      currentLectureId.current = currentLecture.id
      startTimer()
    }    
	}, [currentLecture])
}