"use client"

import { useEffect, useRef } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface SymmetryMirrorProps {
  data?: Array<{
    segmentA: string
    segmentB: string
    correlation: number
    position: number
  }>
  className?: string
}

export function SymmetryMirror({ data, className }: SymmetryMirrorProps) {
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

    const centerY = rect.height / 2
    const blockHeight = 40
    const blockWidth = rect.width / (data.length + 1)

    // Draw mirror line
    ctx.strokeStyle = `${MANGO_COLORS.purple}60`
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(rect.width, centerY)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw symmetry blocks
    data.forEach((item, index) => {
      const x = blockWidth * (index + 0.5) - blockWidth * 0.4
      const correlation = item.correlation

      // Color intensity based on correlation
      const intensity = Math.floor(correlation * 255)
      const color =
        correlation > 0.7 ? MANGO_COLORS.coral : correlation > 0.4 ? MANGO_COLORS.orange : MANGO_COLORS.yellow

      // Top block (segment A)
      const topGradient = ctx.createLinearGradient(x, centerY - blockHeight, x, centerY)
      topGradient.addColorStop(0, `${color}${intensity.toString(16).padStart(2, "0")}`)
      topGradient.addColorStop(1, `${color}FF`)

      ctx.fillStyle = topGradient
      ctx.fillRect(x, centerY - blockHeight, blockWidth * 0.8, blockHeight)

      // Bottom block (segment B) - mirrored
      const bottomGradient = ctx.createLinearGradient(x, centerY, x, centerY + blockHeight)
      bottomGradient.addColorStop(0, `${color}FF`)
      bottomGradient.addColorStop(1, `${color}${intensity.toString(16).padStart(2, "0")}`)

      ctx.fillStyle = bottomGradient
      ctx.fillRect(x, centerY, blockWidth * 0.8, blockHeight)

      // Draw connection line
      ctx.strokeStyle = `${color}${Math.floor(correlation * 255)
        .toString(16)
        .padStart(2, "0")}`
      ctx.lineWidth = 2 + correlation * 4
      ctx.beginPath()
      ctx.moveTo(x + blockWidth * 0.4, centerY - blockHeight)
      ctx.lineTo(x + blockWidth * 0.4, centerY + blockHeight)
      ctx.stroke()

      // Draw labels
      ctx.fillStyle = color
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"

      ctx.fillText(item.segmentA, x + blockWidth * 0.4, centerY - blockHeight / 2)
      ctx.fillText(item.segmentB, x + blockWidth * 0.4, centerY + blockHeight / 2)

      // Draw correlation value
      ctx.fillStyle = MANGO_COLORS.purple
      ctx.font = "12px sans-serif"
      ctx.fillText(correlation.toFixed(2), x + blockWidth * 0.4, centerY + blockHeight + 15)
    })

    // Draw title
    ctx.fillStyle = MANGO_COLORS.purple
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Mirror Line", rect.width / 2, centerY - 5)
  }, [data])

  return (
    <BaseChart
      title="Espejo Sonoro"
      description="Simetría formal con bloques espejo y gradientes de correlación"
      className={className}
      badge="Mirror"
    >
      <canvas ref={canvasRef} className="w-full h-64" style={{ width: "100%", height: "256px" }} />
    </BaseChart>
  )
}
