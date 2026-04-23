import { useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatAnalyticsChartDate, formatViews } from "@/lib/format"
import type { GetCourseAnalyticsCompactResponse } from "@/types/dashboard/analytics"
import { AnalyticsChartFullscreenButton } from "./analyticsChartFullscreenButton"

interface AnalyticsDailyViewsAndImpressionsChartProps {
  data: GetCourseAnalyticsCompactResponse["dailyViewsAndImpressions"]
}

const chartConfig = {
  impressions: {
    label: "Impresiones",
    color: "var(--chart-1)",
  },
  views: {
    label: "Vistas",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export const AnalyticsDailyViewsAndImpressionsChart = ({
  data,
}: AnalyticsDailyViewsAndImpressionsChartProps) => {
  const [cumulative, setCumulative] = useState(true)

  const chartData = useMemo(() => {
    const daily = data.rows.map(([viewDate, , impressions, views]) => ({
      viewDate: formatAnalyticsChartDate(viewDate),
      impressions,
      views: views,
    }))

    if (!cumulative) {
      return daily
    }

    let runningImpressions = 0
    let runningViews = 0

    return daily.map((item) => {
      runningImpressions += item.impressions
      runningViews += item.views

      return {
        ...item,
        impressions: runningImpressions,
        views: runningViews,
      }
    })
  }, [data.rows, cumulative])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Vistas e impresiones diarias</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant={cumulative ? "default" : "outline"}
            size="sm"
            onClick={() => setCumulative((prev) => !prev)}
          >
            {cumulative ? "Acumulado" : "Diario"}
          </Button>
          <AnalyticsChartFullscreenButton />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full aspect-auto!">
          <AreaChart data={chartData}>
            <CartesianGrid vertical={false} />
            <YAxis
              tickLine={false}
              width={50}
              label={{ angle: -90, position: "insideLeft", offset: 8 }}
            />
            <XAxis dataKey="viewDate" tickLine={false} axisLine={false} minTickGap={24} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const metricName = name === "impressions" ? "impresiones" : "vistas"
                    return `${metricName}: ${formatViews(Number(value))}`
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="impressions"
              stroke="var(--color-impressions)"
              fill="var(--color-impressions)"
              fillOpacity={0.18}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="var(--color-views)"
              fill="var(--color-views)"
              fillOpacity={0.18}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
