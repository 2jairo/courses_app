import type { IndexEntry } from "@/components/editor/editor-hooks/use-indexes"
import type { PlayLectureResponse, PlayLectureResponseKindDocument } from "@/types/client/lectures"
import React, { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { List, ChevronRight } from "lucide-react"

const EditorReadOnly = React.lazy(() => import('@/components/blocks/readOnly/editor')) 

interface PlayDocumentProps {
  lecture: PlayLectureResponse & { kind: "Document"; data: PlayLectureResponseKindDocument }
}

export function PlayDocument({ lecture }: PlayDocumentProps) {
  const [indexes, setIndexes] = useState<IndexEntry[]>([])
  const scrollToHeadingRef = useRef<(id: string) => void>(() => {})
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showToc, setShowToc] = useState(false)

  const hasToc = indexes.length > 0

  const handleScrollToSection = (id: string) => {
    scrollToHeadingRef.current(id)
    setActiveSection(id)
  }

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const handleSetScrollToHeading = useCallback((fn: (id: string) => void) => {
    scrollToHeadingRef.current = fn
  }, [])

  return (
    <div className="flex h-full gap-6 w-full">
      {/* Table of Contents - Desktop */}
      {hasToc && (
        <aside className="hidden w-64 shrink-0 xl:block">
          <div className="sticky top-0 rounded-lg border border-border bg-card p-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">En esta página</h3>
            <nav className="space-y-1">
              {indexes.map((item) => (
                <TableOfContentsItem
                  key={item.id}
                  item={item}
                  isActive={activeSection === item.id}
                  onClick={() => handleScrollToSection(item.id)}
                />
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="relative flex-1 min-w-0">
        {/* Mobile TOC Toggle */}
        {hasToc && (
          <div className="mb-4 xl:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowToc(!showToc)}
              className="w-full justify-start gap-2"
            >
              <List className="h-4 w-4" />
              Tabla de contenidos
              <ChevronRight
                className={cn(
                  "ml-auto h-4 w-4 transition-transform",
                  showToc && "rotate-90"
                )}
              />
            </Button>

            {/* Mobile TOC Dropdown */}
            {showToc && (
              <div className="mt-2 rounded-lg border border-border bg-card p-4">
                <nav className="space-y-1">
                  {indexes.map((item) => (
                    <TableOfContentsItem
                      key={item.id}
                      item={item}
                      isActive={activeSection === item.id}
                      onClick={() => handleScrollToSection(item.id)}
                    />
                  ))}
                </nav>
              </div>
            )}
          </div>
        )}

        {/* Document Body */}
        <EditorReadOnly 
          key={lecture.slug}
          className=""
          editorSerializedState={lecture.data.body}
          setIndexes={setIndexes}
          setScrollToHeading={handleSetScrollToHeading}
        />
      </div>
    </div>
  )
}

interface TableOfContentsItemProps {
  item: IndexEntry
  isActive: boolean
  onClick: () => void
}

function TableOfContentsItem({ item, isActive, onClick }: TableOfContentsItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "block w-full text-left text-sm transition-colors hover:text-foreground py-1",
        item.level === 1 && "font-medium",
        item.level === 2 && "pl-3",
        item.level === 3 && "pl-6 text-xs",
        isActive
          ? "text-primary border-l-2 border-primary pl-3"
          : "text-muted-foreground"
      )}
    >
      {item.text}
    </button>
  )
}
