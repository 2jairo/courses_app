import type { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalyticsStatCardProps {
  title: string
  value: string
  icon: ReactNode
  subtitle?: string
}

export const AnalyticsStatCard = ({ title, value, icon, subtitle }: AnalyticsStatCardProps) => {
  return (
    <Card className="p-4 gap-0">
      <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>

        <div className="p-1 rounded bg-accent">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-2xl font-bold">{value}</p>

        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}
