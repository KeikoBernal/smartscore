"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, ReferenceLine } from "recharts"
import { BaseChart } from "../base-chart"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface GoldenRatioTimelineProps {
  data?: Array<{ time: number; intensity: number; section: string }>
  totalDuration?: number
  className?: string
}

export function GoldenRatioTimeline({ data, totalDuration = 100, className }: GoldenRatioTimelineProps) {
  // Calculate golden ratio points
  const phi = 1.618033988749
  const goldenPoint1 = totalDuration / phi
  const goldenPoint2 = totalDuration - goldenPoint1

  return (
    <BaseChart
      title="Regla de Oro"
      description="Marcas de offsets φ×duración en timeline chart"
      className={className}
      badge="Golden"
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <ChartTooltip />
          <Line
            type="monotone"
            dataKey="intensity"
            stroke={MANGO_COLORS.coral}
            strokeWidth={3}
            dot={{ fill: MANGO_COLORS.coral, strokeWidth: 2, r: 4 }}
          />
          <ReferenceLine
            x={goldenPoint1}
            stroke={MANGO_COLORS.orange}
            strokeWidth={3}
            strokeDasharray="8,4"
            label={{ value: "φ", position: "top", fill: MANGO_COLORS.orange }}
          />
          <ReferenceLine
            x={goldenPoint2}
            stroke={MANGO_COLORS.yellow}
            strokeWidth={3}
            strokeDasharray="8,4"
            label={{ value: "1-φ", position: "top", fill: MANGO_COLORS.yellow }}
          />
        </LineChart>
      </ResponsiveContainer>
    </BaseChart>
  )
}
