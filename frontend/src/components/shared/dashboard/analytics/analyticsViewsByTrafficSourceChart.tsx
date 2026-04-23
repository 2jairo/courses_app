import { Pie, PieChart } from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatAnalyticsViewSource, formatPercent, formatViews } from "@/lib/format"
import type { GetCourseAnalyticsCompactResponse } from "@/types/dashboard/analytics"
import { AnalyticsChartFullscreenButton } from "./analyticsChartFullscreenButton"
import { renderPieLabel } from "./renderPieLabel"

interface AnalyticsViewsByTrafficSourceChartProps {
  data: GetCourseAnalyticsCompactResponse["viewsByTrafficSource"]
  totalViews: number
}

export const AnalyticsViewsByTrafficSourceChart = ({
  data,
  totalViews
}: AnalyticsViewsByTrafficSourceChartProps) => {
  const chartData = data.rows.map(([viewSource, views], index) => ({
    name: formatAnalyticsViewSource(viewSource),
    views,
    percentage: totalViews > 0 ? views / totalViews : 0,
    fill: `var(--chart-${(index % 5) + 1})`,
  }))

  const chartConfig: ChartConfig = {
    views: {
      label: "Vistas",
    },
    ...Object.fromEntries(chartData.map((item) => [item.name, { label: item.name }])),
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vistas por origen de tráfico</CardTitle>
        <CardAction>
          <AnalyticsChartFullscreenButton />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full aspect-auto!">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, _item, _index, payload) => {
                    const percentage =
                      payload && typeof payload === "object" && "percentage" in payload && typeof payload.percentage === "number"
                        ? payload.percentage
                        : 0

                    return `${formatViews(Number(value))} (${formatPercent(percentage)})`
                  }}
                  nameKey="name"
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="views"
              nameKey="name"
              innerRadius={48}
              outerRadius={84}
              label={renderPieLabel}
              labelLine={false}
            />
            <ChartLegend verticalAlign="bottom" content={<ChartLegendContent className="flex-wrap" nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
