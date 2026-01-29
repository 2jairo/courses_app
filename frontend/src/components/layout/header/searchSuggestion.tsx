import { Separator } from "@/components/ui/separator"
import { History, X } from "lucide-react"

interface SearchSuggestionProps {
  isLast: boolean
  value: string
  setValue: (v: string) => void
}

export const SearchSuggestion = ({ isLast, value, setValue }: SearchSuggestionProps) => {
  return (
    <>
      <li className="flex p-2 items-center gap-2 cursor-pointer hover:bg-accent transition-colors" onMouseDown={() => setValue(value)}>
        <History size={16} />
        <p className="flex-1">{value}</p>
        <X className="hover:bg-accent rounded-full p-1" />
      </li>

      {!isLast && <Separator orientation="horizontal" />}
    </>
  )
}