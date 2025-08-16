"use client"

import { useEffect, useRef } from "react"
import { BaseChart } from "../base-chart"
import { generateOrchestraSeating, MANGO_COLORS, normalizeData } from "@/lib/visualization-utils"

interface OrchestraDensityMapProps {
  data?: Array<{ instrument: string; density: number }>
  className?: string
}

export function OrchestraDensityMap({ data, className }: OrchestraDensityMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Get orchestra seating positions
    const seatingPositions = generateOrchestraSeating()
    const densityValues = data.map((d) => d.density)
    const normalizedDensities = normalizeData(densityValues)

    // Draw orchestra layout
    seatingPositions.forEach((position, index) => {
      const instrumentData = data.find((d) => d.instrument === position.instrument)
      const density = instrumentData?.density || 0
      const normalizedDensity = normalizedDensities[index] || 0

      // Position on canvas
      const x = position.x * rect.width
      const y = position.y * rect.height

      // Circle size based on density
      const radius = 8 + normalizedDensity * 20

      // Color based on section and density
      let color = MANGO_COLORS.purple
      switch (position.section) {
        case "strings":
          color = MANGO_COLORS.purple
          break
        case "woodwinds":
          color = MANGO_COLORS.coral
          break
        case "brass":
          color = MANGO_COLORS.orange
          break
        case "percussion":
          color = MANGO_COLORS.yellow
          break
      }

      // Draw circle with opacity based on density
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = `${color}${Math.floor(0.3 + normalizedDensity * 0.7 * 255)
        .toString(16)
        .padStart(2, "0")}`
      ctx.fill()

      // Draw border
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw instrument label
      ctx.fillStyle = "#333"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(position.instrument, x, y + radius + 15)
    })
  }, [data])

  return (
    <BaseChart
      title="Plano de Orquesta Interactivo"
      description="Densidad instrumental mapeada por posición en la orquesta"
      className={className}
      badge="Interactive"
    >
      <canvas ref={canvasRef} className="w-full h-64 border rounded-lg" style={{ width: "100%", height: "256px" }} />
    </BaseChart>
  )
}
