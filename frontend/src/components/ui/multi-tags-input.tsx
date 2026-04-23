"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { cn } from "@/lib/utils"
import { useRef, useState, useEffect } from "react"

export type MultiTagOption = {
  value: string
  label: string
}

interface MultiTagsInputProps {
  options: MultiTagOption[]
  value: MultiTagOption[]
  customRender?: (t: MultiTagOption) => React.ReactNode
  onChange: (value: MultiTagOption[]) => void
  onInputChange?: (value: string) => void
  onFocus?: () => void
  inputDebounce?: number
  fetchNextPage?: () => Promise<unknown> | unknown
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  maxTags?: number
  minTagLength?: number
  maxTagLength?: number
  createOption?: (input: string) => MultiTagOption
  canCreateOption?: boolean
  placeholder?: string
  className?: string
}

const normalize = (v: string) => v.trim().toLowerCase()

export function MultiTagsInput({
  options,
  value,
  onChange,
  onInputChange,
  onFocus,
  inputDebounce,
  customRender,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  maxTags,
  minTagLength = 1,
  maxTagLength = 30,
  createOption,
  canCreateOption,
  placeholder = "Añadir etiquetas...",
  className,
}: MultiTagsInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    if (inputDebounce && inputDebounce > 0) {
      const handler = setTimeout(() => {
        onInputChange?.(inputValue)
      }, inputDebounce)
      return () => clearTimeout(handler)
    }
  }, [inputValue, inputDebounce, onInputChange])

  const hasReachedMaxTags = typeof maxTags === "number" && value.length >= maxTags

  const isAlreadySelected = (v: string) => {
    const candidateValue = normalize(v)
    return value.some((s) => normalize(s.value) === candidateValue)
  }

  const appendTag = (newTag: MultiTagOption) => {
    if (hasReachedMaxTags) {
      return
    }

    if (isAlreadySelected(newTag.value)) {
      return
    }
    onChange([...value, newTag])
  }

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue)
    if (!inputDebounce) {
      onInputChange?.(nextValue)
    }
  }
  
  const handleUnselect = (option: MultiTagOption) => {
    onChange(value.filter((s) => s.value !== option.value))
  }

  const selectableOptions = hasReachedMaxTags
    ? []
    : options.filter((option) => !isAlreadySelected(option.value))

  const addInputAsTag = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || trimmed.length < minTagLength) {
      return
    }

    const normalizedInput = normalize(trimmed)
    const fromOptions = options.find(
      (option) =>
        normalize(option.label) === normalizedInput ||
        normalize(option.value) === normalizedInput,
    )

    const nextTag = fromOptions ?? createOption?.(trimmed) ?? { value: trimmed, label: trimmed }
    appendTag(nextTag)
    handleInputChange("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current
    if (!input) return

    if ((e.key === "Backspace" || e.key === "Delete") && input.value === "") {
      onChange(value.slice(0, -1))
      return
    }

    if (e.key === "Enter") {
      e.preventDefault()
      addInputAsTag()
      return
    }

    if (e.key === "Escape") {
      input.blur()
    }
  }

  const handleOptionsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!fetchNextPage || !hasNextPage || isFetchingNextPage) {
      return
    }

    const target = e.currentTarget
    const isNearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 8

    if (isNearBottom) {
      fetchNextPage()
    }
  }

  const canCreateFromInput =
    canCreateOption &&
    !hasReachedMaxTags &&
    inputValue.trim().length >= minTagLength &&
    !isAlreadySelected(inputValue) 

  return (
    <Command
      shouldFilter={false}
      onKeyDown={handleKeyDown}
      className={cn("overflow-visible bg-transparent", className)}
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {value.map((option) => (
            <Badge key={option.value} variant="secondary">
              {option.label}
              <button
                type="button"
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={() => handleUnselect(option)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}

          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            disabled={hasReachedMaxTags}
            onValueChange={handleInputChange}
            onBlur={() => setOpen(false)}
            onFocus={() => {
              setOpen(true)
              onFocus?.()
            }}
            placeholder={placeholder}
            maxLength={maxTagLength}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="relative mt-2">
        <CommandList>
          {open && (
            <div className="absolute z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in">
              <CommandGroup className="max-h-60 overflow-auto" onScroll={handleOptionsScroll}>
                {canCreateFromInput && (
                  <CommandItem
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onSelect={addInputAsTag}
                    className="cursor-pointer"
                  >
                    Añadir "{inputValue.trim()}"
                  </CommandItem>
                )}

                {selectableOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onSelect={() => {
                      appendTag(option)
                      handleInputChange("")
                    }}
                    className="cursor-pointer flex"
                  >
                    {customRender ? customRender(option) : option.label}
                  </CommandItem>
                ))}
              </CommandGroup>

              {!selectableOptions.length && !canCreateFromInput && (
                <CommandEmpty>No hay resultados</CommandEmpty>
              )}

              {isFetchingNextPage && (
                <p className="px-2 py-1 text-xs text-muted-foreground">Cargando...</p>
              )}
            </div>
          )}
        </CommandList>
      </div>
    </Command>
  )
}
