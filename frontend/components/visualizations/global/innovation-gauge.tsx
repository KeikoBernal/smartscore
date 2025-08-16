"use client"

import { useEffect, useRef, useState } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface InnovationGaugeProps {
  data?: {
    innovationScore: number
    zScore: number
    percentile: number
    category: "conservative" | "moderate" | "innovative" | "revolutionary"
  }
  className?: string
}

export function InnovationGauge({ data, className }: InnovationGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    if (!data) return

    const targetValue = data.innovationScore
    const animationDuration = 2000
    const steps = 60
    const increment = targetValue / steps

    let currentStep = 0
    const animationInterval = setInterval(() => {
      if (currentStep >= steps) {
        setAnimatedValue(targetValue)
        clearInterval(animationInterval)
      } else {
        setAnimatedValue(increment * currentStep)
        currentStep++
      }
    }, animationDuration / steps)

    return () => clearInterval(animationInterval)
  }, [data])

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

    const centerX = rect.width / 2
    const centerY = rect.height / 2 + 20
    const radius = Math.min(rect.width, rect.height) / 3

    // Draw gauge background
    ctx.strokeStyle = `${MANGO_COLORS.purple}30`
    ctx.lineWidth = 20
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI)
    ctx.stroke()

    // Draw gauge segments
    const segments = [
      { color: MANGO_COLORS.yellow, label: "Conservative", start: 0, end: 0.25 },
      { color: MANGO_COLORS.orange, label: "Moderate", start: 0.25, end: 0.5 },
      { color: MANGO_COLORS.coral, label: "Innovative", start: 0.5, end: 0.75 },
      { color: MANGO_COLORS.purple, label: "Revolutionary", start: 0.75, end: 1 },
    ]

    segments.forEach((segment) => {
      const startAngle = Math.PI + segment.start * Math.PI
      const endAngle = Math.PI + segment.end * Math.PI

      ctx.strokeStyle = segment.color
      ctx.lineWidth = 18
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.stroke()
    })

    // Draw needle
    const needleAngle = Math.PI + (animatedValue / 100) * Math.PI
    const needleLength = radius - 10

    ctx.strokeStyle = MANGO_COLORS.purple
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(centerX + Math.cos(needleAngle) * needleLength, centerY + Math.sin(needleAngle) * needleLength)
    ctx.stroke()

    // Draw center circle
    ctx.fillStyle = MANGO_COLORS.purple
    ctx.beginPath()
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI)
    ctx.fill()

    // Draw labels
    ctx.fillStyle = MANGO_COLORS.purple
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`${animatedValue.toFixed(1)}%`, centerX, centerY + 40)

    ctx.font = "12px sans-serif"
    ctx.fillText(`Z-Score: ${data.zScore.toFixed(2)}`, centerX, centerY + 60)
    ctx.fillText(`${data.percentile}th percentile`, centerX, centerY + 75)

    // Draw category label
    ctx.font = "14px sans-serif"
    ctx.fillStyle =
      segments.find((s) => animatedValue / 100 >= s.start && animatedValue / 100 < s.end)?.color || MANGO_COLORS.purple
    ctx.fillText(data.category.toUpperCase(), centerX, centerY + 95)
  }, [data, animatedValue])

  return (
    <BaseChart
      title="Termómetro de Innovación"
      description="Índice de innovación con gauge animado mostrando Z-score relativo"
      className={className}
      badge="Gauge"
    >
      <canvas ref={canvasRef} className="w-full h-80" style={{ width: "100%", height: "320px" }} />
    </BaseChart>
  )
}
