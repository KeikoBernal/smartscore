"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"
import { BaseChart } from "../base-chart"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { CIRCLE_OF_FIFTHS, MANGO_COLORS } from "@/lib/visualization-utils"

interface ChordProgressionPathProps {
  data?: Array<{ chord: string; position: number; tension: number }>
  className?: string
}

export function ChordProgressionPath({ data, className }: ChordProgressionPathProps) {
  const chartData =
    data?.map((item) => {
      const circlePosition = CIRCLE_OF_FIFTHS.find((pos) => pos.key === item.chord.charAt(0))
      return {
        chord: item.chord,
        x: circlePosition ? Math.cos((circlePosition.angle * Math.PI) / 180) * item.tension : 0,
        y: circlePosition ? Math.sin((circlePosition.angle * Math.PI) / 180) * item.tension : 0,
        tension: item.tension,
        angle: circlePosition?.angle || 0,
      }
    }) || []

  return (
    <BaseChart
      title="Camino de Acordes"
      description="Progresiones armónicas sobre el círculo de quintas"
      className={className}
      badge="Circle"
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <Line
            type="monotone"
            dataKey="tension"
            stroke={MANGO_COLORS.coral}
            strokeWidth={3}
            dot={{ fill: MANGO_COLORS.coral, strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, fill: MANGO_COLORS.orange }}
          />
          <ChartTooltip />
        </LineChart>
      </ResponsiveContainer>
    </BaseChart>
  )
}
