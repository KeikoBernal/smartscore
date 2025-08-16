"use client"

import { useEffect, useRef } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface PolyrhythmRibbonsProps {
  data?: Array<{ voice: string; onsets: number[]; density: number }>
  className?: string
}

export function PolyrhythmRibbons({ data, className }: PolyrhythmRibbonsProps) {
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

    const ribbonHeight = rect.height / (data.length + 1)
    const colors = [
      MANGO_COLORS.purple,
      MANGO_COLORS.coral,
      MANGO_COLORS.orange,
      MANGO_COLORS.yellow,
      MANGO_COLORS.pink,
    ]

    data.forEach((voice, voiceIndex) => {
      const y = ribbonHeight * (voiceIndex + 0.5)
      const color = colors[voiceIndex % colors.length]

      // Draw ribbon background
      ctx.fillStyle = `${color}20`
      ctx.fillRect(0, y - ribbonHeight * 0.3, rect.width, ribbonHeight * 0.6)

      // Draw onset markers
      voice.onsets.forEach((onset) => {
        const x = (onset / Math.max(...data.flatMap((d) => d.onsets))) * rect.width

        // Draw vertical line for onset
        ctx.strokeStyle = `${color}80`
        ctx.lineWidth = 2 + voice.density * 3
        ctx.beginPath()
        ctx.moveTo(x, y - ribbonHeight * 0.25)
        ctx.lineTo(x, y + ribbonHeight * 0.25)
        ctx.stroke()

        // Draw intersection points where ribbons cross
        data.forEach((otherVoice, otherIndex) => {
          if (otherIndex !== voiceIndex) {
            otherVoice.onsets.forEach((otherOnset) => {
              const otherX = (otherOnset / Math.max(...data.flatMap((d) => d.onsets))) * rect.width
              if (Math.abs(x - otherX) < 5) {
                // Draw crossing point
                ctx.fillStyle = MANGO_COLORS.coral
                ctx.beginPath()
                ctx.arc(x, y, 3, 0, 2 * Math.PI)
                ctx.fill()
              }
            })
          }
        })
      })

      // Draw voice label
      ctx.fillStyle = color
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(voice.voice, 10, y + 5)
    })
  }, [data])

  return (
    <BaseChart
      title="Cintas Entrelazadas"
      description="Polirritmia representada como cintas horizontales que se cruzan"
      className={className}
      badge="Ribbons"
    >
      <canvas ref={canvasRef} className="w-full h-64" style={{ width: "100%", height: "256px" }} />
    </BaseChart>
  )
}
