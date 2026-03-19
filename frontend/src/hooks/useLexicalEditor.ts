import type { SerializedEditorState, SerializedLexicalNode } from "lexical"
import { useCallback, useState } from "react"

const initialEditorState: SerializedEditorState = {
  root: {
    children: [
      {
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
}


export const useLexicalEditor = (initialData?: SerializedEditorState<SerializedLexicalNode>) => {
  const [editorState, setEditorState] = useState<SerializedEditorState>(initialData ? initialData : initialEditorState)
  
  const handleEditorChange = useCallback((newEditorState: SerializedEditorState) => {
    setEditorState(newEditorState)
  }, [])

  return [editorState, handleEditorChange] as const
}