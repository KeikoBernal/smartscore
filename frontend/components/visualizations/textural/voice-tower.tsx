"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { BaseChart } from "../base-chart"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { MANGO_PALETTE } from "@/lib/visualization-utils"

interface VoiceTowerProps {
  data?: Array<{
    measure: number
    soprano: number
    alto: number
    tenor: number
    bass: number
    total: number
  }>
  className?: string
}

export function VoiceTower({ data, className }: VoiceTowerProps) {
  return (
    <BaseChart
      title="Torre de Pentagramas"
      description="Voces simultáneas apiladas estilo pastel"
      className={className}
      badge="Stacked"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="measure" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <ChartTooltip />
          <Bar dataKey="bass" stackId="voices" fill={MANGO_PALETTE[0]} radius={[0, 0, 0, 0]} />
          <Bar dataKey="tenor" stackId="voices" fill={MANGO_PALETTE[1]} radius={[0, 0, 0, 0]} />
          <Bar dataKey="alto" stackId="voices" fill={MANGO_PALETTE[2]} radius={[0, 0, 0, 0]} />
          <Bar dataKey="soprano" stackId="voices" fill={MANGO_PALETTE[3]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  )
}
