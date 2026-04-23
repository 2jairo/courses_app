import type { ReactNode } from "react"
import { useCreateSearchProvider, SearchContext } from "./createSearchProvider"

interface SearchProviderProps {
  children: ReactNode
}

export function SearchProvider({ children }: SearchProviderProps) {
  const value = useCreateSearchProvider()

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}
