import type { SearchMode } from "@/types/common/search"
import { useState } from "react"

interface RecentQuery {
  query: string
  mode: SearchMode
}

const LS_KEY = "search_recent_queries"

export const useRecentQueries = () => {
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>(() => {
    const stored = localStorage.getItem(LS_KEY)
    let parsed = [] as RecentQuery[]

    if (stored) {
      try {
        parsed = JSON.parse(stored).map((item: RecentQuery | string) => 
          typeof item === "string" ? { query: item, mode: "fts" } : item
        )
      } catch {
        //
      }
    }
    return parsed
  })

  const saveRecentQuery = (query: string, mode: SearchMode) => {
    if (!query.trim()) {
      return
    }

    const filtered = recentQueries.filter((q) => q.query !== query)
    const updated = [{ query, mode }, ...filtered].slice(0, 30)
    setRecentQueries(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
  }

  const removeRecentQuery = (e: React.MouseEvent, queryToRemove: string) => {
    e.preventDefault()
    e.stopPropagation()
    const updated = recentQueries.filter((q) => q.query !== queryToRemove)
    setRecentQueries(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
  }

  return {
    recentQueries,
    saveRecentQuery,
    removeRecentQuery
  }
}