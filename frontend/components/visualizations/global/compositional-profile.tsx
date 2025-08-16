"use client"

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts"
import { BaseChart } from "../base-chart"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface CompositionalProfileProps {
  data?: Array<{
    metric: string
    value: number
    maxValue: number
    percentile: number
  }>
  className?: string
}

export function CompositionalProfile({ data, className }: CompositionalProfileProps) {
  const chartData =
    data?.map((item) => ({
      metric: item.metric,
      value: item.value,
      normalizedValue: (item.value / item.maxValue) * 100,
      percentile: item.percentile,
    })) || []

  return (
    <BaseChart
      title="Retrato Musical"
      description="Perfil compositivo en radar chart dentro de marco SVG"
      className={className}
      badge="Profile"
    >
      <div className="relative">
        {/* Decorative SVG frame */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={MANGO_COLORS.purple} stopOpacity="0.3" />
              <stop offset="50%" stopColor={MANGO_COLORS.coral} stopOpacity="0.2" />
              <stop offset="100%" stopColor={MANGO_COLORS.orange} stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <rect
            x="10"
            y="10"
            width="calc(100% - 20px)"
            height="calc(100% - 20px)"
            fill="none"
            stroke="url(#frameGradient)"
            strokeWidth="3"
            rx="15"
          />
          <circle cx="50%" cy="50%" r="8" fill={MANGO_COLORS.coral} opacity="0.6" />
        </svg>

        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={chartData} margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
            <PolarGrid stroke={`${MANGO_COLORS.purple}40`} />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: MANGO_COLORS.purple }} />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: MANGO_COLORS.purple }}
              tickCount={5}
            />
            <Radar
              name="Value"
              dataKey="normalizedValue"
              stroke={MANGO_COLORS.coral}
              fill={MANGO_COLORS.coral}
              fillOpacity={0.3}
              strokeWidth={3}
              dot={{ fill: MANGO_COLORS.coral, strokeWidth: 2, r: 4 }}
            />
            <Radar
              name="Percentile"
              dataKey="percentile"
              stroke={MANGO_COLORS.orange}
              fill={MANGO_COLORS.orange}
              fillOpacity={0.2}
              strokeWidth={2}
              strokeDasharray="5,5"
            />
            <ChartTooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </BaseChart>
  )
}
