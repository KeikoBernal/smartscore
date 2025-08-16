"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { BaseChart } from "../base-chart"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface HarmonicTensionWavesProps {
  data?: Array<{ measure: number; tension: number; dissonance: number }>
  className?: string
}

export function HarmonicTensionWaves({ data, className }: HarmonicTensionWavesProps) {
  return (
    <BaseChart
      title="Gráfico de Olas"
      description="Tensión armónica representada como ondas suaves"
      className={className}
      badge="Waves"
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="tensionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={MANGO_COLORS.coral} stopOpacity={0.8} />
              <stop offset="95%" stopColor={MANGO_COLORS.coral} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="dissonanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={MANGO_COLORS.purple} stopOpacity={0.6} />
              <stop offset="95%" stopColor={MANGO_COLORS.purple} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis dataKey="measure" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <ChartTooltip />
          <Area
            type="monotone"
            dataKey="tension"
            stackId="1"
            stroke={MANGO_COLORS.coral}
            fill="url(#tensionGradient)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="dissonance"
            stackId="2"
            stroke={MANGO_COLORS.purple}
            fill="url(#dissonanceGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </BaseChart>
  )
}
