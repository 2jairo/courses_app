import { type JSX } from "react"
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable"
import { cn } from "@/lib/utils"

type Props = {
  placeholder: string
  placeholderClassName?: string
  readOnly?: boolean
}

export function ContentEditable({
  placeholder,
  placeholderClassName,
  readOnly
}: Props): JSX.Element {
  return (
    <LexicalContentEditable
      className={cn(
        `ContentEditable__root relative h-full overflow-auto focus:outline-none`,
        !readOnly && "px-2 py-2"
      )}
      aria-placeholder={placeholder}
      placeholder={
        <div
          className={
            placeholderClassName ??
            `text-muted-foreground pointer-events-none absolute top-0 left-0 overflow-hidden px-8 py-[18px] text-ellipsis select-none`
          }
        >
          {placeholder}
        </div>
      }
    />
  )
}
