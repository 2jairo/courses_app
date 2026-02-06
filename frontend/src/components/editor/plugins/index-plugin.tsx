import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIndexes, type IndexLevel } from "../editor-hooks/use-indexes"

interface IndexPluginProps {
  includeLevels?: IndexLevel[]
  className?: string
  readOnly?: boolean
}

export function IndexPlugin({ 
  includeLevels = [1, 2, 3], 
  readOnly
}: IndexPluginProps) {
  const { indexEntries, scrollToHeading } = useIndexes({ includeLevels, readOnly })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={indexEntries.length === 0}>
          Index
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-96 overflow-y-auto w-auto max-w-64">
        <DropdownMenuGroup> 
          {indexEntries.map((item) => (
            <DropdownMenuItem
              onClick={() => scrollToHeading(item.id)}
              key={item.id}
              className="relative"
              style={{ paddingLeft: `${(item.level -1) * 20 + 8}px` }}
            >
              {item.level -1 > 0 && (
                <div className="absolute left-0 top-0 bottom-0 flex pl-2">
                  {Array.from({ length: item.level -1 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn("border-l border-border", i === 0 ? 'ml-0' : 'ml-5')}
                    />
                  ))}
                </div>
              )}

              <p className="truncate whitespace-nowrap overflow-hidden text-ellipsis">
                {item.text}
              </p>
            </DropdownMenuItem>
          ))}         
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}