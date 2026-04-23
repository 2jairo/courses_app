import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatPercent, formatViews } from "@/lib/format"
import type { GetCourseAnalyticsCompactResponse } from "@/types/dashboard/analytics"
import type { CourseResponseExtended } from "@/types/dashboard/courses"
import { AnalyticsChartFullscreenButton } from "./analyticsChartFullscreenButton"

interface AnalyticsLectureAnalyticsChartProps {
  data: GetCourseAnalyticsCompactResponse["lectureAnalytics"]
  course?: CourseResponseExtended
}

const chartConfig = {
  views: {
    label: "Vistas",
    // color: "white",
  },
  retention: {
    label: "Retención",
    color: "orange",
  },
  engagement: {
    label: "Engagement",
    color: "var(--chart-3)",
  },
  dropout: {
    label: "Drop por lección",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export const AnalyticsLectureAnalyticsChart = ({
  data,
  course,
}: AnalyticsLectureAnalyticsChartProps) => {
  const truncateLabel = (label: string, maxLength = 50) => {
    if (label.length <= maxLength) return label
    return `${label.slice(0, maxLength)}...`
  }

  // 🔗 Map lectures with section ordering
  const lecturesById = new Map(
    (course?.sections ?? [])
      .map((s) => ({
        ...s,
        lectures: s.lectures.map((l) => ({
          ...l,
          section: s,
        })),
      }))
      .flatMap((section) => section.lectures)
      .map((lecture) => [lecture.id, lecture])
  )

  const lecturesInOrder = (course?.sections ?? [])
    .sort((a, b) => a.position - b.position)
    .flatMap((section) =>
      [...section.lectures]
        .sort((a, b) => a.position - b.position)
        .map((lecture) => lecture.id)
    )

  const rowByLectureId = new Map(
    data.rows.map(([lectureId, views, viewSeconds]) => [
      lectureId,
      { views, viewSeconds },
    ])
  )

  // Always render every lecture from the course. Missing analytics rows default to zero.
  const rows =
    lecturesInOrder.length > 0
      ? lecturesInOrder.map((lectureId) => {
          const row = rowByLectureId.get(lectureId)
          return [lectureId, row?.views ?? 0, row?.viewSeconds ?? 0] as const
        })
      : [...data.rows]

  const baselineViews = rows[0]?.[1] ?? 0

  const maxAvgSecondsPerView = rows.reduce((max, [, views, viewSeconds]) => {
    const avg = views > 0 ? viewSeconds / views : 0
    return Math.max(max, avg)
  }, 0)

  // 🚀 Build chart data (fixed logic)
  const chartData = rows.map(([lectureId, views, viewSeconds], i) => {
    const avgSecondsPerView = views > 0 ? viewSeconds / views : 0

    const engagement =
      maxAvgSecondsPerView > 0
        ? avgSecondsPerView / maxAvgSecondsPerView
        : 0

    const retention =
      baselineViews > 0
        ? views / baselineViews
        : 0

    const prevViews = i > 0 ? rows[i - 1][1] : views

    const dropout =
      i > 0 && prevViews > 0
        ? Math.max(0, 1 - views / prevViews)
        : 0

    return {
      lectureId,
      lecture: lecturesById.get(lectureId)?.title ?? `Lección ${lectureId}`,
      views,
      engagement,
      retention,
      dropout,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analítica por lección</CardTitle>
        <CardAction>
          <AnalyticsChartFullscreenButton />
        </CardAction>
        <CardDescription>
          Retención de usuarios, engagement y puntos de abandono entre lecciones.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-120 w-full aspect-auto!">
          <ComposedChart data={chartData}>
            <CartesianGrid vertical={false} />

            {/* % axis */}
            <YAxis
              yAxisId="left"
              tickLine={false}
              width={100}
              tickFormatter={(value: number) => formatPercent(value, 0)}
              label={{
                value: "Retención / Engagement / Drop",
                angle: -90,
                offset: 8,
              }}
            />

            {/* Views axis */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              width={100}
              tickFormatter={(value: number) => formatViews(value)}
              label={{
                value: "Vistas",
                angle: -90,
                offset: 8,
              }}
            />

            <XAxis
              dataKey="lecture"
              tickLine={false}
              interval={0}
              height={170}
              angle={30}
              textAnchor="start"
              tickFormatter={(value: string) => truncateLabel(value)}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "views") {
                      return `Vistas: ${formatViews(Number(value))}`
                    }

                    if (name === "retention") {
                      return `Retención: ${formatPercent(Number(value))}`
                    }

                    if (name === "dropout") {
                      return `Drop en esta lección: ${formatPercent(Number(value))}`
                    }

                    return `Engagement: ${formatPercent(Number(value))}`
                  }}
                />
              }
            />

            {/* Bars */}
            <Bar
              yAxisId="right"
              dataKey="views"
              fill="var(--color-views)"
              radius={4}
              fillOpacity={0.25}
            />

            {/* Lines */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="retention"
              stroke="var(--color-retention)"
              strokeWidth={2}
              dot={false}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="engagement"
              stroke="var(--color-engagement)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="dropout"
              stroke="var(--color-dropout)"
              strokeWidth={2}
              dot={false}
            />

            <ChartLegend verticalAlign="top" content={<ChartLegendContent />} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}