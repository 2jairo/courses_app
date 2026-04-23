import { formatPercent } from "@/lib/format"

export const renderPieLabel = (() => {
  const minGap = 16
  const occupiedY = {
    left: [] as number[],
    right: [] as number[],
  }

  return ({
    name,
    percent,
    x,
    y,
    cx,
    cy,
    outerRadius,
  }: {
    name?: string
    percent?: number
    x?: number
    y?: number
    cx?: number
    cy?: number
    outerRadius?: number
  }) => {
    const safePercent = percent ?? 0
    if (safePercent <= 0) {
      return null
    }

    const rawX = x ?? 0
    const rawY = y ?? 0
    const centerX = cx ?? 0
    const centerY = cy ?? 0
    const radius = outerRadius ?? 84

    const side = rawX >= centerX ? "right" : "left"
    const sideYs = occupiedY[side]
    let adjustedY = rawY

    sideYs.forEach((existingY) => {
      if (Math.abs(adjustedY - existingY) < minGap) {
        adjustedY = existingY + minGap
      }
    })

    const minY = centerY - radius - 24
    const maxY = centerY + radius + 24
    adjustedY = Math.max(minY, Math.min(maxY, adjustedY))

    sideYs.push(adjustedY)

    return (
      <text
        x={rawX}
        y={adjustedY}
        textAnchor={side === "right" ? "start" : "end"}
        dominantBaseline="central"
        className="fill-foreground text-xs"
      >
        {`${String(name)} (${formatPercent(safePercent)})`}
      </text>
    )
  }
})()