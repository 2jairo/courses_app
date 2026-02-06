"use client"

import {
  type InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import type { SerializedEditorState } from "lexical"

import { editorTheme } from "@/components/editor/themes/editor-theme"
import { TooltipProvider } from "@/components/ui/tooltip"

import { nodes } from "./nodes"
import { Plugins } from "./plugins"
import type { IndexEntry } from "@/components/editor/editor-hooks/use-indexes"

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error)
  },
}

export default function ReadOnlyEditor({
  editorSerializedState,
  className = '',
  setIndexes,
  setScrollToHeading,
}: {
  editorSerializedState?: SerializedEditorState
  className: string
  setIndexes: (indexes: IndexEntry[]) => void
  setScrollToHeading: (fn: (id: string) => void) => void
}) {
  return (
    <div className="bg-background rounded-lg shadow">
      <LexicalComposer
        initialConfig={{
          editable: false,
          ...editorConfig,
          editorState: JSON.stringify(editorSerializedState)
        }}
      >
        <TooltipProvider>
          <Plugins className={className} setIndexes={setIndexes} setScrollToHeading={setScrollToHeading}/>
          <OnChangePlugin ignoreSelectionChange={true} onChange={() => {}}/>
        </TooltipProvider>
      </LexicalComposer>
    </div>
  )
}
