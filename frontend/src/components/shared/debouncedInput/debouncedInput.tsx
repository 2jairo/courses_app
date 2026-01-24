import { useEffect, useState } from "react"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { XIcon } from "lucide-react"

interface DebouncedInputProps {
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  delay?: number
}

export function DebouncedInput({ placeholder,  value = "", onChange, delay = 500 }: DebouncedInputProps) {
  const [internalValue, setInternalValue] = useState(value)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  useEffect(() => {
    const handler = internalValue.trim() !== value
      ? setTimeout(() => {
        onChange(internalValue.trim())
      }, delay)
      : -1

    return () => clearTimeout(handler)
  }, [internalValue, onChange])

  return (
    <InputGroup className="w-full">
      <InputGroupInput
        placeholder={placeholder}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
      />
      {internalValue && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            onClick={() => {
              setInternalValue("")
              onChange("")
            }}
          >
            <XIcon className="size-3.5" />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
