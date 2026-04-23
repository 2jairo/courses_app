interface HighlightedTextProps {
  text: string
  highlight: string
  className?: string
}

export const HighlightedText = ({ text, highlight, className }: HighlightedTextProps) => {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>
  }
  
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)
  
  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-background text-primary font-medium">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  )
}