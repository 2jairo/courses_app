import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatAnalyticsChartDate, formatViews } from "@/lib/format"
import type { GetCourseAnalyticsCompactResponse } from "@/types/dashboard/analytics"
import { AnalyticsChartFullscreenButton } from "./analyticsChartFullscreenButton"

interface AnalyticsUniqueViewsPerWeekChartProps {
  data: GetCourseAnalyticsCompactResponse["uniqueViewsPerWeek"]
  totalUniqueViewers: number
}

const chartConfig = {
  uniqueUsers: {
    label: "Usuarios únicos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export const AnalyticsUniqueViewsPerWeekChart = ({ data, totalUniqueViewers }: AnalyticsUniqueViewsPerWeekChartProps) => {
  const chartData = data.rows.map(([viewDate, , uniqueUsers]) => ({
    viewDate: formatAnalyticsChartDate(viewDate),
    uniqueUsers,
  }))
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Vistas únicas por semana</CardTitle>
        <CardDescription className="flex gap-2 items-center">
          <p>
            Total: {formatViews(totalUniqueViewers)}
          </p>
          <AnalyticsChartFullscreenButton />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full aspect-auto!">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <YAxis
              tickLine={false}
              width={30}
              label={{ angle: -90, position: "insideLeft", offset: 8 }}
            />
            <XAxis dataKey="viewDate" tickLine={false} axisLine={false} minTickGap={24} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatViews(Number(value))}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="uniqueUsers"
              stroke="var(--color-uniqueUsers)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
