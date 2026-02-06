import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $isHeadingNode, type HeadingTagType } from "@lexical/rich-text"
import { $getRoot, type LexicalNode } from "lexical"
import { useEffect, useMemo, useState } from "react"

export type IndexLevel = 1 | 2 | 3
export interface IndexEntry {
  id: string
  level: IndexLevel
  text: string
}

interface UseIndexesProps {
  includeLevels?: IndexLevel[]
  readOnly?: boolean
}

export const useIndexes = ({ includeLevels = [1,2,3], readOnly }: UseIndexesProps) => {
  const [editor] = useLexicalComposerContext()
  const [indexEntries, setIndexEntries] = useState<IndexEntry[]>([])
  const headingTagTypeToLevel: Partial<Record<HeadingTagType, IndexLevel>> = useMemo(() => ({
    h1: 1,
    h2: 2,
    h3: 3,
  }), [])

  const generateId = (level: IndexLevel, node: LexicalNode) => {
    return `heading${level}${readOnly ? 'ro' : 'rw'}${node.getKey()}`
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      })
    }
  }

  const updateHeadings = () => {
    const entries: IndexEntry[] = []
    
    editor.getEditorState().read(() => {
      const root = $getRoot()
      const children = root.getChildren()
      
      children.forEach((node) => {
        if ($isHeadingNode(node)) {
          const level = headingTagTypeToLevel[node.getTag()]!
          
          if (includeLevels.includes(level)) {
            const text = node.getTextContent()

            if(text.length === 0) {
              return
            }

            const id = generateId(level, node)
            const element = editor.getElementByKey(node.getKey())
            if(element) {
              element.id = id
            }
            entries.push({ id, level, text })
          }
        }
      })
    })

    setIndexEntries(entries)
  }

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      updateHeadings()
    })
  }, [editor])

  return {
    indexEntries,
    scrollToHeading
  }
}