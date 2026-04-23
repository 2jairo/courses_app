import { useEffect, useRef } from "react"

interface UseInfiniteScrollProps {
  fetchNextPage: () => void
  hasNextPage?: boolean
  isFetchingNextPage: boolean
}

export const useInfiniteScroll = ({ fetchNextPage, hasNextPage, isFetchingNextPage }: UseInfiniteScrollProps) => {
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = observerTarget.current
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (target) {
      observer.observe(target)
    }

    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])
  
  return observerTarget
}