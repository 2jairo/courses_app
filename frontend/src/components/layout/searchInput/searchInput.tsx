import { useState, useEffect, useRef, useContext } from "react"
import { ArrowUpIcon, Search, Clock, Sparkles, TrendingUp, X, RotateCcw } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../../ui/input-group"
import { useSearchCoursesAutocompleteQuery } from "@/queries/client/search/useSearchCoursesAutocompleteQuery"
import { Badge } from "@/components/ui/badge"
import { SearchInputFilters } from "./searchInputFilters"
import { HighlightedText } from "./highlightedText"
import { formatSearchMode } from "@/lib/format"
import type { SearchCoursesRequest } from "@/types/client/search"
import { SearchContext } from "@/context/search/createSearchProvider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { useRecentQueries } from "./useRecentQueries"

interface SearchInputProps {
  focused: boolean
  setFocused: (val: boolean) => void
}

export const SearchInput = ({ focused, setFocused }: SearchInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { filters: contextFilters, updateUrlFilters } = useContext(SearchContext)
  const [filters, setFilters] = useState<SearchCoursesRequest>(contextFilters)
  const { recentQueries, removeRecentQuery, saveRecentQuery } = useRecentQueries()

  useEffect(() => {
    setFilters(contextFilters)
  }, [contextFilters])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | FocusEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }

    if (focused) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("focusin", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("focusin", handleClickOutside)
    }
  }, [focused])

  const [debouncedQ, setDebouncedQ] = useState(filters.q)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(filters.q)
    }, 150)
    return () => clearTimeout(timer)
  }, [filters.q])

  const { data: autocompleteData } = useSearchCoursesAutocompleteQuery({ q: debouncedQ })

  const handleSubmitOrClick = (filtersOverride?: Partial<SearchCoursesRequest>) => {
    const f = { ...filters, ...filtersOverride } as SearchCoursesRequest
    saveRecentQuery(f.q, f.mode)
    setFocused(false)

    updateUrlFilters(f)
  }

  const handleResetFilters = () => {
    const f = { mode: filters.mode, q: "" } as SearchCoursesRequest
    updateUrlFilters(f)
  }

  const titles = autocompleteData?.titles || []
  const popular = filters.q ? [] : (autocompleteData?.popular || [])

  return (
    <div ref={containerRef} className="relative flex-1 group" tabIndex={-1}>
      <InputGroup>
        <InputGroupAddon>
          <Search className="h-4 w-4" />
        </InputGroupAddon>

        <InputGroupInput
          placeholder="Buscar cursos..."
          value={filters.q}
          onChange={(e) => setFilters((prev) => ({...prev, q: e.target.value}))}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmitOrClick()
            }
          }}
        />

        <InputGroupAddon align="inline-end">
          {focused && (
            <InputGroupButton
              variant="ghost"
              className="rounded-full cursor-pointer text-muted-foreground"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation()
                setFocused(false)
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar buscador</span>
            </InputGroupButton>
          )}


          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <InputGroupButton 
                size="icon-xs" 
                variant="ghost"
                onClick={() => handleResetFilters()} 
                type="button"
              >
                <RotateCcw className="w-4 h-4" />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>Reiniciar filtros</TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <InputGroupButton 
                size="icon-xs" 
                variant={filters.mode === 'ai' ? 'default' : 'secondary'}
                onClick={() => setFilters((prev) => ({ ...prev, mode: prev.mode === 'ai' ? 'fts' : 'ai' }))} 
                type="button"
              >
                <Sparkles className="w-4 h-4" />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>Modo IA</TooltipContent>
          </Tooltip>

          <InputGroupButton
            variant="default"
            className="rounded-full cursor-pointer"
            size="icon-xs"
            onClick={() => handleSubmitOrClick()}
          >
            <ArrowUpIcon className="h-4 w-4" />
            <span className="sr-only">Buscar</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {focused && (
        <div className="absolute top-full left-0 z-50 w-full mt-2 p-2 bg-background border rounded-lg shadow-lg">
          {(recentQueries.length > 0 || popular.length > 0 || titles.length > 0) && (
            <ul className="mb-3 flex flex-col gap-0.5 rounded-md overflow-hidden bg-background">
              {titles.map((item, i) => (
                <li
                  key={i}
                  onClick={() => handleSubmitOrClick({ q: item.query, mode: item.mode })}
                  className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer text-sm rounded-md transition-colors"
                >
                  <div className="flex items-center min-w-0 pr-2 flex-1">
                    <Search className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                    <HighlightedText text={item.query} highlight={filters.q} className="truncate flex-1" />
                  </div>
                  {item.mode === "ai" && (
                    <Badge variant="outline" className="text-[10px] shrink-0 uppercase pointer-events-none">
                      {formatSearchMode(item.mode, true)}
                    </Badge>
                  )}
                </li>
              ))}

              {!filters.q && popular.map((item, i) => (
                <li
                  key={i}
                  onClick={() => handleSubmitOrClick({ q: item.query, mode: item.mode })}
                  className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer text-sm rounded-md transition-colors"
                >
                  <div className="flex items-center min-w-0 pr-2 flex-1">
                    <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                    <span className="truncate flex-1">{item.query}</span>
                  </div>
                  {item.mode === "ai" && (
                    <Badge variant="outline" className="text-[10px] shrink-0 uppercase pointer-events-none">
                      {formatSearchMode(item.mode, true)}
                    </Badge>
                  )}
                </li>
              ))}

              {!filters.q && recentQueries.slice(0, 10).map((item, i) => (
                <li
                  key={i}
                  onClick={() => handleSubmitOrClick({ q: item.query, mode: item.mode })}
                  className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer text-sm group/item rounded-md transition-colors"
                >
                  <div className="flex items-center min-w-0 pr-2 flex-1">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                    <span className="truncate flex-1">{item.query}</span>
                    {item.mode === "ai" && (
                      <Badge variant="outline" className="text-[10px] shrink-0 ml-2 uppercase pointer-events-none">
                        {formatSearchMode(item.mode, true)}
                      </Badge>
                    )}
                  </div>
                  <button
                    type="button"
                    className="p-1 -mr-1 rounded-sm text-muted-foreground opacity-0 group-hover/item:opacity-100 hover:bg-background/80 focus:opacity-100 transition-all shrink-0"
                    onClick={(e) => removeRecentQuery(e, item.query)}
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="sr-only">Remover</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-end border-border border-t pt-4">
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => handleResetFilters()}>
                  <RotateCcw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reiniciar filtros</TooltipContent>
            </Tooltip>
          </div>

          <SearchInputFilters 
            filters={filters}
            onChange={setFilters}
          />
        </div>
      )}
    </div>
  )
}
