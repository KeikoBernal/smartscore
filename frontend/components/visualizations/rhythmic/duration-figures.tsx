"use client"

import { useEffect, useRef } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS, normalizeData } from "@/lib/visualization-utils"

interface DurationFiguresProps {
  data?: Array<{ duration: string; frequency: number; symbol: string }>
  className?: string
}

export function DurationFigures({ data, className }: DurationFiguresProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    ctx.clearRect(0, 0, rect.width, rect.height)

    // Normalize frequencies for sizing
    const frequencies = data.map((d) => d.frequency)
    const normalizedFreqs = normalizeData(frequencies)

    // Draw hanging figures
    const spacing = rect.width / (data.length + 1)

    data.forEach((item, index) => {
      const x = spacing * (index + 1)
      const normalizedFreq = normalizedFreqs[index]

      // String length based on frequency
      const stringLength = 20 + normalizedFreq * 60
      const figureSize = 15 + normalizedFreq * 25

      // Draw hanging string
      ctx.strokeStyle = `${MANGO_COLORS.purple}60`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, 20)
      ctx.lineTo(x, 20 + stringLength)
      ctx.stroke()

      // Draw attachment point
      ctx.fillStyle = MANGO_COLORS.purple
      ctx.beginPath()
      ctx.arc(x, 20, 3, 0, 2 * Math.PI)
      ctx.fill()

      // Draw musical figure (simplified as circle with symbol)
      const figureY = 20 + stringLength

      // Color based on duration type
      let color = MANGO_COLORS.purple
      if (item.duration.includes("quarter")) color = MANGO_COLORS.coral
      else if (item.duration.includes("eighth")) color = MANGO_COLORS.orange
      else if (item.duration.includes("sixteenth")) color = MANGO_COLORS.yellow
      else if (item.duration.includes("half")) color = MANGO_COLORS.pink

      ctx.fillStyle = `${color}80`
      ctx.beginPath()
      ctx.arc(x, figureY, figureSize, 0, 2 * Math.PI)
      ctx.fill()

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw symbol
      ctx.fillStyle = color
      ctx.font = `${Math.max(12, figureSize * 0.8)}px serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(item.symbol, x, figureY)

      // Draw label
      ctx.fillStyle = MANGO_COLORS.purple
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.duration, x, figureY + figureSize + 15)
      ctx.fillText(`${item.frequency}`, x, figureY + figureSize + 28)
    })
  }, [data])

  return (
    <BaseChart
      title="Colgantes de Figuras"
      description="Duraciones predominantes representadas como figuras colgantes"
      className={className}
      badge="Hanging"
    >
      <canvas ref={canvasRef} className="w-full h-64" style={{ width: "100%", height: "256px" }} />
    </BaseChart>
  )
}
