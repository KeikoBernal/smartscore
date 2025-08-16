"use client"

import { useEffect, useRef } from "react"
import { BaseChart } from "../base-chart"
import { generateOrchestraSeating, MANGO_COLORS } from "@/lib/visualization-utils"

interface SpatialRegisterMapProps {
  data?: Array<{
    instrument: string
    averagePitch: number
    pitchRange: { min: number; max: number }
  }>
  className?: string
}

export function SpatialRegisterMap({ data, className }: SpatialRegisterMapProps) {
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

    // Get orchestra seating positions
    const seatingPositions = generateOrchestraSeating()

    // MIDI pitch range for visualization
    const minMidi = 21
    const maxMidi = 108

    data.forEach((instrumentData) => {
      const position = seatingPositions.find((pos) => pos.instrument === instrumentData.instrument)
      if (!position) return

      const x = position.x * rect.width
      const y = position.y * rect.height

      // Draw instrument position
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, 2 * Math.PI)
      ctx.fillStyle = MANGO_COLORS.purple
      ctx.fill()

      // Calculate pitch direction and intensity
      const normalizedPitch = (instrumentData.averagePitch - minMidi) / (maxMidi - minMidi)
      const pitchRange = instrumentData.pitchRange.max - instrumentData.pitchRange.min

      // Draw pitch direction line
      const lineLength = 30 + (pitchRange / 50) * 40
      const targetY = normalizedPitch > 0.5 ? y - lineLength : y + lineLength

      // Color based on register
      let color = MANGO_COLORS.coral
      if (normalizedPitch > 0.8) color = MANGO_COLORS.yellow
      else if (normalizedPitch > 0.6) color = MANGO_COLORS.orange
      else if (normalizedPitch > 0.4) color = MANGO_COLORS.coral
      else if (normalizedPitch > 0.2) color = MANGO_COLORS.pink
      else color = MANGO_COLORS.purple

      // Draw gradient line
      const gradient = ctx.createLinearGradient(x, y, x, targetY)
      gradient.addColorStop(0, `${color}FF`)
      gradient.addColorStop(1, `${color}40`)

      ctx.strokeStyle = gradient
      ctx.lineWidth = 3 + (pitchRange / 50) * 3
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, targetY)
      ctx.stroke()

      // Draw arrowhead
      const arrowSize = 8
      const direction = normalizedPitch > 0.5 ? -1 : 1

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(x, targetY)
      ctx.lineTo(x - arrowSize, targetY + direction * arrowSize)
      ctx.lineTo(x + arrowSize, targetY + direction * arrowSize)
      ctx.closePath()
      ctx.fill()

      // Draw instrument label
      ctx.fillStyle = MANGO_COLORS.purple
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(instrumentData.instrument, x, y + 20)
    })
  }, [data])

  return (
    <BaseChart
      title="Mapa de Registro"
      description="Distribución espacial con líneas coloreadas según altura MIDI"
      className={className}
      badge="Spatial"
    >
      <canvas ref={canvasRef} className="w-full h-80" style={{ width: "100%", height: "320px" }} />
    </BaseChart>
  )
}
