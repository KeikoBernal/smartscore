"use client"

import { useEffect, useRef } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface ChordGardenProps {
  data?: Array<{ chord: string; type: string; frequency: number; x: number; y: number }>
  className?: string
}

export function ChordGarden({ data, className }: ChordGardenProps) {
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

    // Draw garden background
    const gradient = ctx.createRadialGradient(
      rect.width / 2,
      rect.height / 2,
      0,
      rect.width / 2,
      rect.height / 2,
      Math.max(rect.width, rect.height) / 2,
    )
    gradient.addColorStop(0, `${MANGO_COLORS.yellow}10`)
    gradient.addColorStop(1, `${MANGO_COLORS.purple}05`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw chord flowers
    data.forEach((chord) => {
      const x = chord.x * rect.width
      const y = chord.y * rect.height
      const size = 10 + (chord.frequency / Math.max(...data.map((d) => d.frequency))) * 30

      // Choose flower shape based on chord type
      let color = MANGO_COLORS.purple
      let petals = 5

      if (chord.type.includes("major")) {
        color = MANGO_COLORS.yellow
        petals = 6
      } else if (chord.type.includes("minor")) {
        color = MANGO_COLORS.coral
        petals = 5
      } else if (chord.type.includes("diminished")) {
        color = MANGO_COLORS.purple
        petals = 4
      } else if (chord.type.includes("augmented")) {
        color = MANGO_COLORS.orange
        petals = 8
      }

      // Draw flower petals
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * 2 * Math.PI
        const petalX = x + Math.cos(angle) * size * 0.7
        const petalY = y + Math.sin(angle) * size * 0.7

        ctx.beginPath()
        ctx.ellipse(petalX, petalY, size * 0.3, size * 0.6, angle, 0, 2 * Math.PI)
        ctx.fillStyle = `${color}80`
        ctx.fill()
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Draw flower center
      ctx.beginPath()
      ctx.arc(x, y, size * 0.2, 0, 2 * Math.PI)
      ctx.fillStyle = MANGO_COLORS.orange
      ctx.fill()

      // Draw stem
      ctx.strokeStyle = `${MANGO_COLORS.purple}60`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, y + size * 0.2)
      ctx.lineTo(x, y + size * 1.5)
      ctx.stroke()

      // Draw chord label
      ctx.fillStyle = MANGO_COLORS.purple
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(chord.chord, x, y + size * 1.8)
    })
  }, [data])

  return (
    <BaseChart
      title="Jardín de Acordes"
      description="Distribución de acordes como flores en un espacio 2D"
      className={className}
      badge="Garden"
    >
      <canvas ref={canvasRef} className="w-full h-80" style={{ width: "100%", height: "320px" }} />
    </BaseChart>
  )
}
