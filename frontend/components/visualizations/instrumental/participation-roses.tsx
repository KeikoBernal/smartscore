"use client"

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts"
import { BaseChart } from "../base-chart"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface ParticipationRosesProps {
  data?: Array<{ family: string; duration: number; participation: number }>
  className?: string
}

export function ParticipationRoses({ data, className }: ParticipationRosesProps) {
  const chartData =
    data?.map((item) => ({
      family: item.family,
      duration: item.duration,
      participation: item.participation,
    })) || []

  return (
    <BaseChart
      title="Rosas de Participación"
      description="Duración promedio por familia instrumental"
      className={className}
      badge="Polar"
    >
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid stroke={`${MANGO_COLORS.purple}40`} />
          <PolarAngleAxis dataKey="family" tick={{ fontSize: 12, fill: MANGO_COLORS.purple }} />
          <PolarRadiusAxis angle={90} domain={[0, "dataMax"]} tick={{ fontSize: 10, fill: MANGO_COLORS.purple }} />
          <Radar
            name="Duration"
            dataKey="duration"
            stroke={MANGO_COLORS.coral}
            fill={MANGO_COLORS.coral}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Participation"
            dataKey="participation"
            stroke={MANGO_COLORS.orange}
            fill={MANGO_COLORS.orange}
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <ChartTooltip />
        </RadarChart>
      </ResponsiveContainer>
    </BaseChart>
  )
}
