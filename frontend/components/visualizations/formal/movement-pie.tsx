"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { BaseChart } from "../base-chart"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { MANGO_PALETTE } from "@/lib/visualization-utils"

interface MovementPieProps {
  data?: Array<{ movement: string; duration: number; percentage: number }>
  className?: string
}

export function MovementPie({ data, className }: MovementPieProps) {
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress((prev) => {
        if (prev >= 100) return 100
        return prev + 2
      })
    }, 50)

    return () => clearInterval(timer)
  }, [data])

  const animatedData =
    data?.map((item) => ({
      ...item,
      animatedPercentage: (item.percentage * animationProgress) / 100,
    })) || []

  return (
    <BaseChart
      title="Pastel de Movimientos"
      description="Duración de secciones con animación de crecimiento"
      className={className}
      badge="Animated"
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={animatedData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={40}
            paddingAngle={2}
            dataKey="animatedPercentage"
            animationBegin={0}
            animationDuration={2000}
          >
            {animatedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={MANGO_PALETTE[index % MANGO_PALETTE.length]} />
            ))}
          </Pie>
          <ChartTooltip />
        </PieChart>
      </ResponsiveContainer>
    </BaseChart>
  )
}
