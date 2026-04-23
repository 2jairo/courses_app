import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCourseViewsAgeRange, formatPercent, formatViews } from "@/lib/format"
import type { GetCourseAnalyticsCompactResponse } from "@/types/dashboard/analytics"
import { COURSE_VIEWS_AGE_RANGE } from "@/types/common/analytics"
import { AnalyticsChartFullscreenButton } from "./analyticsChartFullscreenButton"

interface AnalyticsViewsByAgeRangeChartProps {
  data: GetCourseAnalyticsCompactResponse["viewsByAgeRange"]
  totalViews: number
}

const chartConfig: ChartConfig = {
  views: {
    label: "Vistas",
  },
   
}

export const AnalyticsViewsByAgeRangeChart = ({ data, totalViews }: AnalyticsViewsByAgeRangeChartProps) => {
  const chartDataInner = COURSE_VIEWS_AGE_RANGE.map((a) => {
    const views = data.rows.find(([ageRange]) => ageRange === a)
    
    if(views) {
      return {
        ageRange: formatCourseViewsAgeRange(a),
        views: views[1],
        percentage: totalViews > 0 ? views[1] / totalViews : 0,
        color: "var(--chart-3)",
      }
    } else {
      return { 
        ageRange: formatCourseViewsAgeRange(a), 
        views: 0, 
        percentage: 0,
        color: "var(--chart-3)",
      }
    }
  })

  const unknownAgeRangeViews = data.rows.find(([ageRange]) => ageRange === null)
  const chartData = unknownAgeRangeViews
    ? [...chartDataInner, {
      ageRange: "No registrados",
      views: unknownAgeRangeViews[1],
      percentage: totalViews > 0 ? unknownAgeRangeViews[1] / totalViews : 0,
      color: "rgb(128, 128, 128)",
    }]
    : [...chartDataInner]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vistas por rango de edad</CardTitle>
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
            <XAxis dataKey="ageRange" tickLine={false} axisLine={false} minTickGap={16} />
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
            <Bar dataKey="views" radius={6}>
              {chartData.map((item) => (
                <Cell key={item.ageRange} fill={item.color} />
              ))}
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
