"use client"

import { useEffect, useRef } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface ThematicSimultaneityProps {
  data?: Array<{
    motif: string
    measures: Array<{ measure: number; intensity: number; active: boolean }>
  }>
  className?: string
}

export function ThematicSimultaneity({ data, className }: ThematicSimultaneityProps) {
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

    if (!data.length) return

    const maxMeasures = Math.max(...data.flatMap((d) => d.measures.map((m) => m.measure)))
    const cellWidth = (rect.width - 100) / maxMeasures
    const cellHeight = (rect.height - 60) / data.length

    // Draw grid background
    ctx.strokeStyle = `${MANGO_COLORS.purple}20`
    ctx.lineWidth = 1

    // Vertical lines (measures)
    for (let i = 0; i <= maxMeasures; i++) {
      const x = 80 + i * cellWidth
      ctx.beginPath()
      ctx.moveTo(x, 40)
      ctx.lineTo(x, rect.height - 20)
      ctx.stroke()
    }

    // Horizontal lines (motifs)
    for (let i = 0; i <= data.length; i++) {
      const y = 40 + i * cellHeight
      ctx.beginPath()
      ctx.moveTo(80, y)
      ctx.lineTo(rect.width - 20, y)
      ctx.stroke()
    }

    // Draw motif labels
    ctx.fillStyle = MANGO_COLORS.purple
    ctx.font = "12px sans-serif"
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"

    data.forEach((motifData, motifIndex) => {
      const y = 40 + motifIndex * cellHeight + cellHeight / 2
      ctx.fillText(motifData.motif, 75, y)
    })

    // Draw measure numbers
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.font = "10px sans-serif"

    for (let i = 1; i <= maxMeasures; i += Math.ceil(maxMeasures / 20)) {
      const x = 80 + (i - 1) * cellWidth + cellWidth / 2
      ctx.fillText(i.toString(), x, rect.height - 15)
    }

    // Draw light panels
    data.forEach((motifData, motifIndex) => {
      const y = 40 + motifIndex * cellHeight
      const colors = [MANGO_COLORS.coral, MANGO_COLORS.orange, MANGO_COLORS.yellow, MANGO_COLORS.pink]
      const motifColor = colors[motifIndex % colors.length]

      motifData.measures.forEach((measureData) => {
        if (measureData.active) {
          const x = 80 + (measureData.measure - 1) * cellWidth

          // Light intensity based on measure intensity
          const alpha = Math.floor((0.3 + measureData.intensity * 0.7) * 255)
            .toString(16)
            .padStart(2, "0")

          // Draw illuminated cell
          ctx.fillStyle = `${motifColor}${alpha}`
          ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2)

          // Add glow effect for high intensity
          if (measureData.intensity > 0.7) {
            ctx.shadowColor = motifColor
            ctx.shadowBlur = 10
            ctx.fillStyle = `${motifColor}60`
            ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2)
            ctx.shadowBlur = 0
          }

          // Draw border for active cells
          ctx.strokeStyle = motifColor
          ctx.lineWidth = 2
          ctx.strokeRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2)
        }
      })
    })

    // Draw title
    ctx.fillStyle = MANGO_COLORS.purple
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Motif Activity Panel", rect.width / 2, 25)
  }, [data])

  return (
    <BaseChart
      title="Panel de Luces"
      description="Simultaneidad temática con celdas iluminadas según coincidencia"
      className={className}
      badge="Grid"
    >
      <canvas ref={canvasRef} className="w-full h-80" style={{ width: "100%", height: "320px" }} />
    </BaseChart>
  )
}
