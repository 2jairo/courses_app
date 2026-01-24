"use client"

import {
  type InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import type { EditorState, SerializedEditorState } from "lexical"

import { editorTheme } from "@/components/editor/themes/editor-theme"
import { TooltipProvider } from "@/components/ui/tooltip"

import { nodes } from "./nodes"
import { Plugins } from "./plugins"

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error)
  },
}

export default function ReadOnlyEditor({
  editorState,
  editorSerializedState,
  className = '',
}: {
  editorState?: EditorState
  editorSerializedState?: SerializedEditorState
  className: string
}) {
  return (
    <div className="bg-background rounded-lg border shadow">
      <LexicalComposer
        initialConfig={{
          editable: false,
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState
            ? { editorState: JSON.stringify(editorSerializedState) }
            : {}),
        }}
      >
        <TooltipProvider>
          <Plugins className={className}/>
          <OnChangePlugin ignoreSelectionChange={true} onChange={() => {}}/>
        </TooltipProvider>
      </LexicalComposer>
    </div>
  )
}
