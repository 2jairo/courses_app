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
import { formatPercent, formatUserSex, formatViews } from "@/lib/format"
import type { GetCourseAnalyticsCompactResponse } from "@/types/dashboard/analytics"
import { USER_SEX } from "@/types/client/auth"
import { AnalyticsChartFullscreenButton } from "./analyticsChartFullscreenButton"
import { renderPieLabel } from "./renderPieLabel"

interface AnalyticsViewsByViewerSexChartProps {
  data: GetCourseAnalyticsCompactResponse["viewsByViewerSex"]
  totalViews: number
}

export const AnalyticsViewsByViewerSexChart = ({
  data,
  totalViews
}: AnalyticsViewsByViewerSexChartProps) => {
  const chartDataInner = USER_SEX.map((userSex, index) => {
    const views = data.rows.find(([uS]) => userSex === uS)

    if(views) {
      return {
        name: formatUserSex(userSex),
        views: views[1],
        percentage: totalViews > 0 ? views[1] / totalViews : 0,
        fill: `var(--chart-${(index % 5) + 1})`,
      }
    } else {
      return {
        name: formatUserSex(userSex),
        views: 0,
        percentage: 0,
        fill: `var(--chart-${(index % 5) + 1})`,
      }
    }
  })
  
  const unknownSexViews = data.rows.find(([userSex,]) => userSex === null)
  const chartData = unknownSexViews
    ? [...chartDataInner, {
        name: "No registrados",
        views: unknownSexViews[1],
        percentage: totalViews > 0 ? unknownSexViews[1] / totalViews : 0,
        fill: "rgb(128, 128, 128)",
      }]
    : [...chartDataInner]

  const chartConfig: ChartConfig = {
    views: {
      label: "Vistas",
    },
    ...Object.fromEntries(chartData.map((item) => [item.name, { label: item.name }])),
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Vistas demográficas</CardTitle>
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
