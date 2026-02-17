import { SortAsc, SortDesc, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select"
import { DebouncedInput } from "@/components/shared/debouncedInput/debouncedInput"
import type { GetFilesRequest } from "@/types/dashboard/files"
import { formatFileKind, formatFileStatus } from "@/lib/format"
import { FILE_KIND, FILE_STATUS, type FileKind, type FileStatus } from "@/types/common/files"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"


interface FileListFiltersProps {
  filters: Omit<GetFilesRequest, 'courseId'>
  disabledFilters?: ('q' | 'kind' | 'status' | 'user' | 'sort')[]
  onFiltersChange: (filters: Omit<GetFilesRequest, 'courseId'>) => void
  refetch: () => void
  isRefetching: boolean
  usernameOptions?: string[]
}

const SORT_OPTIONS = [
  { value: 'date' as const, label: 'Fecha de creación' },
  { value: 'name' as const, label: 'Nombre' },
  { value: 'size' as const, label: 'Tamaño' },
  { value: 'user' as const, label: 'Usuario' },
]

export const FileListFilters = ({ 
  filters,
  onFiltersChange, 
  usernameOptions = [],
  disabledFilters = [],
  isRefetching,
  refetch
}: FileListFiltersProps) => {

  const updateFilter = <K extends keyof Omit<GetFilesRequest, 'courseId'>>(
    key: K,
    value: Omit<GetFilesRequest, 'courseId'>[K]
  ) => {
    if(filters[key] === value) return

    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const resetFilters = () => {
    const newFilters = { ...filters }
    if (!disabledFilters.includes('q')) newFilters.q = ''
    if (!disabledFilters.includes('user')) newFilters.user = []
    if (!disabledFilters.includes('status')) newFilters.status = []
    if (!disabledFilters.includes('kind')) newFilters.kind = []
    if (!disabledFilters.includes('sort')) {
      newFilters.sortBy = 'date'
      newFilters.sortOrder = 'desc'
    }
    onFiltersChange(newFilters)
  }

  const kindOptions: MultiSelectOption[] = FILE_KIND.map(kind => ({
    value: kind,
    label: formatFileKind(kind)
  }))

  const statusOptions: MultiSelectOption[] = FILE_STATUS.map(status => ({
    value: status,
    label: formatFileStatus(status)
  }))

  const userOptionsForSelect: MultiSelectOption[] = usernameOptions.map(username => ({
    value: username,
    label: username
  }))

  const selectedKindOptions: MultiSelectOption[] = (filters.kind || []).map(kind => ({
    value: kind,
    label: formatFileKind(kind)
  }))

  const selectedStatusOptions: MultiSelectOption[] = (filters.status || []).map(status => ({
    value: status,
    label: formatFileStatus(status)
  }))

  const selectedUserOptions: MultiSelectOption[] = (filters.user || []).map(user => ({
    value: user,
    label: user
  }))

  const hasActiveFilters = 
    (!disabledFilters.includes('status') && filters.status && filters.status.length) || 
    (!disabledFilters.includes('kind') && filters.kind && filters.kind.length) || 
    (!disabledFilters.includes('user') && filters.user && filters.user.length) || 
    (!disabledFilters.includes('q') && filters.q)

  return (
    <div className="bg-card rounded-lg border p-3 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Name */}
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground">Nombre</label>

          <DebouncedInput
            disabled={disabledFilters.includes('q')}
            placeholder="Buscar archivos por nombre..."
            value={filters.q || ''}
            onChange={(value) => updateFilter('q', value || '')}
          />
        </div>

        {/* Sort controls && actions */}
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
                  onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  disabled={disabledFilters.includes('sort')}
                >
                  {filters.sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Dirección
              </TooltipContent>
            </Tooltip>

            {hasActiveFilters && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetFilters}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Limpiar Filtros
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Kind filter */}
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground">Tipo</label>
          <MultiSelect
            options={kindOptions}
            value={selectedKindOptions}
            onChange={(selected) => {
              const values = selected.map(option => option.value as FileKind)
              updateFilter('kind', values)
            }}
            placeholder="Seleccionar tipos"
            className={disabledFilters.includes('kind') ? 'opacity-50 pointer-events-none' : ''}
          />
        </div>

        {/* Status filter */}
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground">Estado</label>
          <MultiSelect
            options={statusOptions}
            value={selectedStatusOptions}
            onChange={(selected) => {
              const values = selected.map(option => option.value as FileStatus)
              updateFilter('status', values)
            }}
            placeholder="Seleccionar estados"
            className={disabledFilters.includes('status') ? 'opacity-50 pointer-events-none' : ''}
          />
        </div>

        {/* User filter && refresh */}
        {usernameOptions.length > 0 && (
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground">Usuario</label>

            <div className="flex items-start">
              <MultiSelect
                options={userOptionsForSelect}
                value={selectedUserOptions}
                onChange={(selected) => {
                  const values = selected.map(option => option.value)
                  updateFilter('user', values)
                }}
                placeholder="Seleccionar usuarios"
                className={disabledFilters.includes('user') ? 'opacity-50 pointer-events-none' : ''}
              />
              
    
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="m-1"
                    size="icon"
                    onClick={() => refetch()}
                    disabled={isRefetching}
                  >
                    <RefreshCw className={`h-4 w-4`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Refrescar
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}