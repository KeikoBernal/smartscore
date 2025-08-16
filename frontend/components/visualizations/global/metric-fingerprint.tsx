"use client"

import { useEffect, useRef } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface MetricFingerprintProps {
  data?: Array<{
    measure: number
    metrics: {
      melodic: number
      harmonic: number
      rhythmic: number
      textural: number
      formal: number
    }
  }>
  className?: string
}

export function MetricFingerprint({ data, className }: MetricFingerprintProps) {
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

    const barWidth = rect.width / data.length
    const maxHeight = rect.height - 40

    // Musical symbols for different metrics
    const symbols = {
      melodic: "♪",
      harmonic: "♯",
      rhythmic: "♫",
      textural: "♬",
      formal: "𝄞",
    }

    const colors = {
      melodic: MANGO_COLORS.coral,
      harmonic: MANGO_COLORS.orange,
      rhythmic: MANGO_COLORS.yellow,
      textural: MANGO_COLORS.pink,
      formal: MANGO_COLORS.purple,
    }

    data.forEach((measureData, index) => {
      const x = index * barWidth
      const metrics = Object.entries(measureData.metrics) as Array<[keyof typeof symbols, number]>

      // Create barcode-like stripes for each metric
      let currentY = 20
      const stripeHeight = maxHeight / 5

      metrics.forEach(([metricName, value]) => {
        const normalizedValue = Math.max(0.1, value) // Minimum visibility
        const stripeWidth = barWidth * 0.8
        const stripeX = x + barWidth * 0.1

        // Draw stripe with intensity based on value
        const alpha = Math.floor((0.3 + normalizedValue * 0.7) * 255)
          .toString(16)
          .padStart(2, "0")

        ctx.fillStyle = `${colors[metricName]}${alpha}`
        ctx.fillRect(stripeX, currentY, stripeWidth, stripeHeight * normalizedValue)

        // Add musical symbol overlay for high values
        if (value > 0.7) {
          ctx.fillStyle = colors[metricName]
          ctx.font = `${Math.floor(stripeHeight * 0.6)}px serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(symbols[metricName], stripeX + stripeWidth / 2, currentY + (stripeHeight * normalizedValue) / 2)
        }

        // Draw border
        ctx.strokeStyle = colors[metricName]
        ctx.lineWidth = 1
        ctx.strokeRect(stripeX, currentY, stripeWidth, stripeHeight * normalizedValue)

        currentY += stripeHeight
      })

      // Draw measure number
      if (index % Math.ceil(data.length / 20) === 0) {
        ctx.fillStyle = MANGO_COLORS.purple
        ctx.font = "10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(measureData.measure.toString(), x + barWidth / 2, rect.height - 5)
      }
    })

    // Draw legend
    const legendY = 5
    let legendX = 10

    Object.entries(colors).forEach(([metricName, color]) => {
      ctx.fillStyle = color
      ctx.fillRect(legendX, legendY, 15, 10)
      ctx.strokeStyle = color
      ctx.strokeRect(legendX, legendY, 15, 10)

      ctx.fillStyle = MANGO_COLORS.purple
      ctx.font = "10px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(metricName, legendX + 20, legendY + 8)

      legendX += metricName.length * 8 + 35
    })
  }, [data])

  return (
    <BaseChart
      title="Huella Digital Sonora"
      description="Firma métrica como código de barras con símbolos musicales"
      className={className}
      badge="Barcode"
    >
      <canvas ref={canvasRef} className="w-full h-64" style={{ width: "100%", height: "256px" }} />
    </BaseChart>
  )
}
