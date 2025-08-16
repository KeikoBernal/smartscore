"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { BaseChart } from "../base-chart"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { MANGO_PALETTE } from "@/lib/visualization-utils"

interface FamilyDistributionProps {
  data?: Array<{ family: string; strings: number; woodwinds: number; brass: number; percussion: number }>
  className?: string
}

export function FamilyDistribution({ data, className }: FamilyDistributionProps) {
  return (
    <BaseChart
      title="Escenario Segmentado"
      description="Distribución de tiempo sonoro normalizado por familia"
      className={className}
      badge="Stacked"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="family" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <ChartTooltip />
          <Bar dataKey="strings" stackId="a" fill={MANGO_PALETTE[0]} />
          <Bar dataKey="woodwinds" stackId="a" fill={MANGO_PALETTE[1]} />
          <Bar dataKey="brass" stackId="a" fill={MANGO_PALETTE[2]} />
          <Bar dataKey="percussion" stackId="a" fill={MANGO_PALETTE[3]} />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  )
}
