import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Slider } from "../../ui/slider"
import { FilterFacetableFieldInput } from "./filterFieldInput"
import { MultiTagsInput } from "../../ui/multi-tags-input"
import type { SearchCoursesRequest } from "@/types/client/search"
import type { CourseLecturesAccesibility } from "@/types/common/courses"
import { cn } from "@/lib/utils"
import type { SortByFields } from "@/types/common/search"

const SORT_BY_OPTIONS = {
  "trending": "Tendencia",
  "updatedAt": "Actualización",
  "discountedPrice": "Precio",
  "discountPercent": "Descuento",
  "avgRating": "Calificación",
  "totalReviews": "Reseñas",
  "totalPurchases": "Ventas",
}

const SORT_ORDER_OPTIONS = {
  "desc": "Descendente",
  "asc": "Ascendente",
}

interface  SearchInputFiltersProps {
  filters: SearchCoursesRequest
  onChange: (f: SearchCoursesRequest) => void
}

export const SearchInputFilters = ({ filters, onChange }: SearchInputFiltersProps) => {
  const updateFilter = <K extends keyof SearchCoursesRequest>(
    key: K,
    value: SearchCoursesRequest[K]
  ) => {
    if(filters[key] === value) return

    onChange({
      ...filters,
      [key]: value
    })
  }
  
  return (
    <div className="p-2 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className={cn("text-xs transition-colors", filters.sortBy && "text-primary font-medium")}>
            Ordenar Por
          </Label>
          <MultiTagsInput 
            className="bg-transparent"
            placeholder="Relevancia"
            options={Object.entries(SORT_BY_OPTIONS).map(([value, label]) => ({ value, label }))}
            value={filters.sortBy ? [{ label: SORT_BY_OPTIONS[filters.sortBy], value: filters.sortBy }] : []}
            onChange={(items) => updateFilter('sortBy', items.length > 0 ? items[items.length -1].value as SortByFields : undefined)}
            maxTags={2}
            canCreateOption={false}
          />
        </div>
        <div className="space-y-1">
          <Label className={cn("text-xs transition-colors", filters.sortOrder && "text-primary font-medium")}>
            Orden
          </Label>
          <MultiTagsInput 
            className="bg-transparent"
            placeholder="Descendente"
            options={Object.entries(SORT_ORDER_OPTIONS).map(([value, label]) => ({ value, label }))}
            value={filters.sortOrder ? [{ label: SORT_ORDER_OPTIONS[filters.sortOrder], value: filters.sortOrder }] : []}
            onChange={(items) => updateFilter('sortOrder', items.length > 0 ? items[items.length -1].value as 'asc' | 'desc' : undefined)}
            maxTags={2}
            canCreateOption={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className={cn("text-xs transition-colors", filters.minDiscountedPrice && filters.minDiscountedPrice > 0 && "text-primary font-medium")}>
            Precio Mínimo
          </Label>
          <Input
            type="number"
            min={0}
            placeholder="Mín"
            value={filters.minDiscountedPrice || ''}
            onChange={(e) => updateFilter('minDiscountedPrice', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="space-y-1">
          <Label className={cn("text-xs transition-colors", filters.maxDiscountedPrice && filters.maxDiscountedPrice > 0 && "text-primary font-medium")}>
            Precio Máximo
          </Label>
          <Input
            type="number"
            min={filters.minDiscountedPrice || 0}
            placeholder="Máx"
            value={filters.maxDiscountedPrice || ''}
            onChange={(e) => updateFilter('maxDiscountedPrice', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <Label className={cn("text-xs transition-colors", filters.minAvgRating && filters.minAvgRating > 0 && "text-primary font-medium")}>
            Calificación Mínima
          </Label>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded transition-colors">
            {filters.minAvgRating || 0}
          </span>
        </div>
        <Slider
          min={0}
          max={5}
          step={0.1}
          value={[filters.minAvgRating || 0]}
          onValueChange={(val) => updateFilter('minAvgRating', val[0])}
        />
      </div>

      <FilterFacetableFieldInput
        field="tags"
        values={filters.tags || []}
        onChange={(tags) => updateFilter('tags', tags)}
      />
      <FilterFacetableFieldInput
        field="language"
        values={filters.language || []}
        onChange={(language) => updateFilter('language', language )}
      />
      <FilterFacetableFieldInput
        field="author"
        values={filters.author || []}
        onChange={(author) => updateFilter('author', author)}
      />
      <FilterFacetableFieldInput
        field="lectureAccesibility"
        values={filters.lectureAccesibility || []}
        onChange={(la) => updateFilter('lectureAccesibility', la as CourseLecturesAccesibility[])}
      />
    </div>
  )
}