import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin"
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { YouTubePlugin } from "@/components/editor/plugins/embeds/youtube-plugin"
import { CodeHighlightPlugin } from "@/components/editor/plugins/code-highlight-plugin"
import { useIndexes, type IndexEntry } from "@/components/editor/editor-hooks/use-indexes"
import { useEffect } from "react"

interface Props {
  setIndexes: (indexes: IndexEntry[]) => void
  setScrollToHeading: (fn: (id: string) => void) => void
  className: string
}

export function Plugins({ className, setIndexes, setScrollToHeading }: Props) {
  const { indexEntries, scrollToHeading } = useIndexes({ readOnly: true })

  useEffect(() => {
    setIndexes(indexEntries)
    setScrollToHeading(scrollToHeading)
  }, [indexEntries, scrollToHeading, setIndexes, setScrollToHeading])

  return (
    <div className="relative">
      <div className={`relative ${className}`}>
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="">
                <ContentEditable readOnly placeholder={"Start typing ..."} />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <HistoryPlugin />
        <ClickableLinkPlugin />
        <TablePlugin />
        <CodeHighlightPlugin />
        <YouTubePlugin />
      </div>
    </div>
  )
}


