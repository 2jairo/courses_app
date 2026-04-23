import { useFilterSuggestionsQuery } from "@/queries/client/search/useFilterSuggestionsQuery"
import { formatCourseLectureAccesibility, formatFacetableField, formatLanguage, formatViews } from "@/lib/format"
import { Label } from "../../ui/label"
import { MultiTagsInput } from "../../ui/multi-tags-input"
import { Badge } from "@/components/ui/badge"
import { MAX_COURSE_TAG_LENGTH, MAX_COURSE_TAGS, MIN_COURSE_TAG_LENGTH } from "@/types/common/tags"
import { useState } from "react"
import type { FacetableFields } from "@/types/common/search"
import type { CourseLecturesAccesibility } from "@/types/common/courses"
import { cn } from "@/lib/utils"

const formatOption = (o: string, field: FacetableFields) => {
  if(field === 'language') {
    return { label: formatLanguage(o), value: o }
  }
  if(field === 'lectureAccesibility') {
    return { label: formatCourseLectureAccesibility(o as CourseLecturesAccesibility), value: o }
  }

  return { label: o, value: o }
} 

export const FilterFacetableFieldInput = ({
  field,
  values,
  onChange,
}: {
  field: FacetableFields
  values: string[]
  onChange: (v: string[]) => void
}) => {
  const [q, setQ] = useState('')
  const [enabled, setEnabled] = useState(false)
  const { data: suggestions = [] } = useFilterSuggestionsQuery({ field, q }, enabled)
  const options = suggestions.map((s) => formatOption(s.name, field))

  const customRedner = (t: { label: string; value: string }) => {
    const suggestion = suggestions.find((s) => s.name === t.value)
    return (
      <div className="flex items-center justify-between gap-2">
        <span>{t.label}</span>
        <Badge variant="outline">{suggestion ? formatViews(suggestion.count) : ""}</Badge>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <Label className={cn("text-xs transition-colors", values.length > 0 && "text-primary font-medium")}>
        {formatFacetableField(field)}
      </Label>
      <MultiTagsInput
        options={options}
        value={values.map((v) => formatOption(v, field))}
        onChange={(newValues) => onChange(newValues.map((nv) => nv.value))}
        onFocus={() => setEnabled(true)}
        placeholder={`Añadir ${formatFacetableField(field).toLowerCase()}...`}
        className="bg-transparent"
        customRender={(t) => customRedner(t)}
        onInputChange={(value) => setQ(value)}
        maxTags={MAX_COURSE_TAGS}
        maxTagLength={MAX_COURSE_TAG_LENGTH}
        minTagLength={MIN_COURSE_TAG_LENGTH}
        inputDebounce={150}
      />
    </div>
  )
}
