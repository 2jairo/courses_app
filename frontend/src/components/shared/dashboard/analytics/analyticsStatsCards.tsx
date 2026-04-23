import { Eye, GraduationCap, MousePointerClick, Send, ShoppingCart, Users } from "lucide-react"

import { formatViews } from "@/lib/format"
import type { GetCourseAnalyticsStatsResponse } from "@/types/dashboard/analytics"
import { AnalyticsStatCard } from "./analyticsStatCard"

interface AnalyticsStatsCardsProps {
  stats: GetCourseAnalyticsStatsResponse
}

export const AnalyticsStatsCards = ({ stats }: AnalyticsStatsCardsProps) => {
  const clickThroughRate = stats.totalImpressions > 0
    ? (stats.totalViews / stats.totalImpressions) * 100
    : 0

  const uniqueViewerPurchaseRate = stats.totalUniqueViewers > 0
    ? (stats.totalPurchases / stats.totalUniqueViewers) * 100
    : 0

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
      <AnalyticsStatCard
        title="Vistas"
        value={formatViews(stats.totalViews)}
        icon={<Eye className="h-4 w-4" />}
        subtitle="Total vistas"
      />

      <AnalyticsStatCard
        title="Impresiones"
        value={formatViews(stats.totalImpressions)}
        icon={<Send className="h-4 w-4" />}
        subtitle="Total impresiones"
      />

      <AnalyticsStatCard
        title="Tasa de Clics"
        value={`${clickThroughRate.toFixed(2)}%`}
        icon={<MousePointerClick className="h-4 w-4" />}
        subtitle="Vistas / Impresiones"
      />

      <AnalyticsStatCard
        title="Usuarios únicos"
        value={formatViews(stats.totalUniqueViewers)}
        icon={<Users className="h-4 w-4" />}
        subtitle="Total usuarios únicos"
      />

      <AnalyticsStatCard
        title="Compra por usuario único"
        value={`${uniqueViewerPurchaseRate.toFixed(2)}%`}
        icon={<ShoppingCart className="h-4 w-4" />}
        subtitle="Compras / Usuarios únicos"
      />

      <AnalyticsStatCard
        title="Total compras"
        value={formatViews(stats.totalPurchases)}
        icon={<GraduationCap className="h-4 w-4" />}
        subtitle="Total compras realizadas"
      />
    </div>
  )
}
