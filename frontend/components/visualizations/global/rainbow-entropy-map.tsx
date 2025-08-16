"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { BaseChart } from "../base-chart"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface RainbowEntropyMapProps {
  data?: Array<{
    category: string
    melodicEntropy: number
    harmonicEntropy: number
    rhythmicEntropy: number
  }>
  className?: string
}

export function RainbowEntropyMap({ data, className }: RainbowEntropyMapProps) {
  return (
    <BaseChart
      title="Mapa de Arco Iris"
      description="Entropía melódica/armónica/rítmica con gradiente rainbow"
      className={className}
      badge="Rainbow"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="melodicGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={MANGO_COLORS.coral} />
              <stop offset="50%" stopColor={MANGO_COLORS.orange} />
              <stop offset="100%" stopColor={MANGO_COLORS.yellow} />
            </linearGradient>
            <linearGradient id="harmonicGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={MANGO_COLORS.purple} />
              <stop offset="50%" stopColor={MANGO_COLORS.pink} />
              <stop offset="100%" stopColor={MANGO_COLORS.coral} />
            </linearGradient>
            <linearGradient id="rhythmicGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={MANGO_COLORS.orange} />
              <stop offset="50%" stopColor={MANGO_COLORS.yellow} />
              <stop offset="100%" stopColor={MANGO_COLORS.coral} />
            </linearGradient>
          </defs>
          <XAxis dataKey="category" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <ChartTooltip />
          <Bar dataKey="melodicEntropy" fill="url(#melodicGradient)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="harmonicEntropy" fill="url(#harmonicGradient)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="rhythmicEntropy" fill="url(#rhythmicGradient)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  )
}
