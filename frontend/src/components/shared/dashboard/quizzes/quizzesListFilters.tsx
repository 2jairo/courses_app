import { SortAsc, SortDesc, RefreshCw, X, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DebouncedInput } from "@/components/shared/debouncedInput/debouncedInput"
import type { GetQuizzesRequest } from "@/types/dashboard/quizzes"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface QuizzesListFiltersProps {
  filters: Omit<GetQuizzesRequest, 'courseId'>
  disabledFilters?: ('q' | 'sort')[]
  onFiltersChange: (filters: Omit<GetQuizzesRequest, 'courseId'>) => void
  refetch: () => void
  isRefetching: boolean
}

const SORT_OPTIONS = [
  { value: 'date' as const, label: 'Fecha de creación' },
  { value: 'title' as const, label: 'Título' },
  { value: 'timeLimit' as const, label: 'Límite de tiempo' },
  { value: 'passingScore' as const, label: 'Puntuación mínima' },
]

export const QuizzesListFilters = ({
  filters,
  onFiltersChange,
  disabledFilters = [],
  isRefetching,
  refetch,
}: QuizzesListFiltersProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const updateFilter = <K extends keyof Omit<GetQuizzesRequest, 'courseId'>>(
    key: K,
    value: Omit<GetQuizzesRequest, 'courseId'>[K]
  ) => {
    if (filters[key] === value) return

    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const resetFilters = () => {
    const newFilters = { ...filters }
    if (!disabledFilters.includes('q')) newFilters.q = null
    if (!disabledFilters.includes('sort')) {
      newFilters.sortBy = 'date'
      newFilters.sortOrder = 'desc'
    }
    onFiltersChange(newFilters)
  }

  const hasActiveFilters =
    (!disabledFilters.includes('q') && filters.q) ||
    (!disabledFilters.includes('sort') &&
      (filters.sortBy !== 'date' || filters.sortOrder !== 'desc'))

  return (
    <div className={cn("bg-card rounded-lg border flex flex-col gap-3", isCollapsed ? "p-0" : "p-3")}>
      {!isCollapsed && (
        <div className="flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground">Título</label>
            <DebouncedInput
              disabled={disabledFilters.includes('q')}
              placeholder="Buscar quizzes por título..."
              value={filters.q || ''}
              onChange={(value) => updateFilter('q', value || null)}
            />
          </div>

          {/* Sort controls & actions */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Ordenar por</label>
            <div className="flex items-center gap-2">
              <Select
                value={filters.sortBy}
                onValueChange={(value: typeof filters.sortBy) => updateFilter('sortBy', value)}
                disabled={disabledFilters.includes('sort')}
              >
                <SelectTrigger className="flex-1" disabled={disabledFilters.includes('sort')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() =>
                      updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                    disabled={disabledFilters.includes('sort')}
                  >
                    {filters.sortOrder === 'asc' ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Dirección</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => refetch()}
                    disabled={isRefetching}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refrescar</TooltipContent>
              </Tooltip>

              {hasActiveFilters && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={resetFilters}>
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Limpiar filtros</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full"
        >
          {isCollapsed ? (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Mostrar filtros
            </>
          ) : (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Ocultar filtros
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
