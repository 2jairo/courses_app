import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

export const useValidId = (id: string | undefined, navigateTo: string): number | null => {
  const navigate = useNavigate()
  const parsedId = parseInt(id || "", 10)
  const isInvalid = isNaN(parsedId) || parsedId <= 0
  const hasRedirected = useRef(false)
  
  useEffect(() => {
    if (!hasRedirected.current && isInvalid) {
      hasRedirected.current = true
      navigate(navigateTo, { replace: true })
    }
  }, [isInvalid, navigateTo, navigate])

  return isInvalid ? null : parsedId
}