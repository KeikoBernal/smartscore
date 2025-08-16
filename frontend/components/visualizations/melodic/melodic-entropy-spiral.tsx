"use client"

import { useEffect, useRef } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface MelodicEntropySpiralProps {
  data?: Array<{ measure: number; notes: number[]; entropy: number }>
  className?: string
}

export function MelodicEntropySpiral({ data, className }: MelodicEntropySpiralProps) {
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

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const maxRadius = Math.min(rect.width, rect.height) / 2 - 20

    // Draw staff lines
    ctx.strokeStyle = `${MANGO_COLORS.purple}30`
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      const y = centerY - 40 + i * 20
      ctx.beginPath()
      ctx.moveTo(20, y)
      ctx.lineTo(rect.width - 20, y)
      ctx.stroke()
    }

    // Draw entropy spiral
    data.forEach((point, index) => {
      const angle = (index / data.length) * 4 * Math.PI // 2 full rotations
      const radius = (index / data.length) * maxRadius
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      // Point size based on entropy
      const pointSize = 3 + point.entropy * 8

      // Color based on entropy level
      let color = MANGO_COLORS.purple
      if (point.entropy > 0.7) color = MANGO_COLORS.coral
      else if (point.entropy > 0.4) color = MANGO_COLORS.orange
      else if (point.entropy > 0.2) color = MANGO_COLORS.yellow

      ctx.beginPath()
      ctx.arc(x, y, pointSize, 0, 2 * Math.PI)
      ctx.fillStyle = `${color}80`
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Draw spiral path
    ctx.strokeStyle = `${MANGO_COLORS.purple}20`
    ctx.lineWidth = 2
    ctx.beginPath()
    data.forEach((point, index) => {
      const angle = (index / data.length) * 4 * Math.PI
      const radius = (index / data.length) * maxRadius
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
  }, [data])

  return (
    <BaseChart
      title="Torbellino de Notas"
      description="Entropía melódica representada en espiral sobre pentagrama"
      className={className}
      badge="Spiral"
    >
      <canvas ref={canvasRef} className="w-full h-80" style={{ width: "100%", height: "320px" }} />
    </BaseChart>
  )
}
