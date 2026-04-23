import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDeviceType, formatPercent, formatViews } from "@/lib/format"
import type { GetCourseAnalyticsCompactResponse } from "@/types/dashboard/analytics"
import { DEVICE_TYPE } from "@/types/client/auth"
import { AnalyticsChartFullscreenButton } from "./analyticsChartFullscreenButton"

interface AnalyticsViewsByDeviceChartProps {
  data: GetCourseAnalyticsCompactResponse["viewsByDevice"]
  totalViews: number
}

const chartConfig = {
  views: {
    label: "Vistas",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export const AnalyticsViewsByDeviceChart = ({ data, totalViews }: AnalyticsViewsByDeviceChartProps) => {
  const chartData = DEVICE_TYPE.map((d) => {
    const views = data.rows.find(([device]) => device === d)
    
    if(views) {
      return {
        device: formatDeviceType(d),
        views: views[1],
        percentage: totalViews > 0 ? views[1] / totalViews : 0,
      }
    } else {
      return { device: formatDeviceType(d), views: 0, percentage: 0 }
    }
  }) 

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vistas por dispositivo</CardTitle>
        <CardAction>
          <AnalyticsChartFullscreenButton />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full aspect-auto!">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <YAxis
              tickLine={false}
              width={30}
              label={{ angle: -90, position: "insideLeft", offset: 8 }}
            />
            <XAxis dataKey="device" tickLine={false} axisLine={false} minTickGap={16} />
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
                />
              }
            />
            <Bar dataKey="views" fill="var(--color-views)" radius={6}>
              <LabelList
                dataKey="views"
                position="top"
                formatter={(value: number, entry: { payload?: { percentage?: number } }) => {
                  const percentage = entry?.payload?.percentage ?? 0

                  return `${formatViews(value)} (${formatPercent(percentage)})`
                }}
              />
            </Bar>
            <ChartLegend verticalAlign="bottom" content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
