"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { BaseChart } from "../base-chart"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { MUSICAL_INTERVALS } from "@/lib/visualization-utils"

interface IntervalLadderProps {
  data?: Array<{ interval: string; frequency: number; prominence: number }>
  className?: string
}

export function IntervalLadder({ data, className }: IntervalLadderProps) {
  const chartData =
    data?.map((item) => {
      const intervalInfo = MUSICAL_INTERVALS.find((i) => i.name === item.interval)
      return {
        ...item,
        color: intervalInfo?.color || "#666",
      }
    }) || []

  return (
    <BaseChart
      title="Escalera Musical"
      description="Intervalos predominantes con grosor y color según frecuencia"
      className={className}
      badge="Horizontal"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="horizontal" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis dataKey="interval" type="category" tick={{ fontSize: 11 }} width={50} />
          <ChartTooltip />
          <Bar dataKey="frequency" fill={(entry) => entry.color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  )
}
