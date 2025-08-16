"use client"

import { useEffect, useRef, useState } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface InfiniteRibbonProps {
  data?: Array<{
    voice: string
    contrapuntalIndex: number
    timeline: Array<{ time: number; activity: number }>
  }>
  className?: string
}

export function InfiniteRibbon({ data, className }: InfiniteRibbonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scrollOffset, setScrollOffset] = useState(0)

  useEffect(() => {
    if (!data) return

    const scrollInterval = setInterval(() => {
      setScrollOffset((prev) => (prev + 1) % 1000)
    }, 50)

    return () => clearInterval(scrollInterval)
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

    const ribbonHeight = rect.height / (data.length + 1)
    const colors = [MANGO_COLORS.purple, MANGO_COLORS.coral, MANGO_COLORS.orange, MANGO_COLORS.yellow]

    data.forEach((voice, voiceIndex) => {
      const y = ribbonHeight * (voiceIndex + 0.5)
      const color = colors[voiceIndex % colors.length]
      const ribbonThickness = 10 + voice.contrapuntalIndex * 20

      // Create scrolling pattern
      const patternLength = 200
      const pattern = ctx.createPattern(
        (() => {
          const patternCanvas = document.createElement("canvas")
          patternCanvas.width = patternLength
          patternCanvas.height = ribbonThickness
          const patternCtx = patternCanvas.getContext("2d")!

          // Create wave pattern
          patternCtx.fillStyle = `${color}60`
          patternCtx.fillRect(0, 0, patternLength, ribbonThickness)

          patternCtx.strokeStyle = color
          patternCtx.lineWidth = 2
          patternCtx.beginPath()

          for (let x = 0; x < patternLength; x++) {
            const waveY = ribbonThickness / 2 + Math.sin((x / patternLength) * 4 * Math.PI) * (ribbonThickness / 4)
            if (x === 0) patternCtx.moveTo(x, waveY)
            else patternCtx.lineTo(x, waveY)
          }
          patternCtx.stroke()

          return patternCanvas
        })(),
        "repeat",
      )

      if (pattern) {
        // Apply scrolling transform
        ctx.save()
        ctx.translate(-scrollOffset * (1 + voice.contrapuntalIndex), 0)

        ctx.fillStyle = pattern
        ctx.fillRect(0, y - ribbonThickness / 2, rect.width + scrollOffset * 2, ribbonThickness)

        ctx.restore()
      }

      // Draw voice label
      ctx.fillStyle = color
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`${voice.voice} (${voice.contrapuntalIndex.toFixed(2)})`, 10, y + 5)

      // Draw interweaving points where ribbons cross
      data.forEach((otherVoice, otherIndex) => {
        if (otherIndex !== voiceIndex && Math.abs(voiceIndex - otherIndex) === 1) {
          const otherY = ribbonHeight * (otherIndex + 0.5)
          const crossingPoints = Math.floor(rect.width / 100)

          for (let i = 0; i < crossingPoints; i++) {
            const x = (i * rect.width) / crossingPoints + (scrollOffset % 100)
            const crossIntensity = (voice.contrapuntalIndex + otherVoice.contrapuntalIndex) / 2

            if (crossIntensity > 0.3) {
              ctx.fillStyle = `${MANGO_COLORS.coral}${Math.floor(crossIntensity * 255)
                .toString(16)
                .padStart(2, "0")}`
              ctx.beginPath()
              ctx.arc(x, (y + otherY) / 2, 3 + crossIntensity * 5, 0, 2 * Math.PI)
              ctx.fill()
            }
          }
        }
      })
    })
  }, [data, scrollOffset])

  return (
    <BaseChart
      title="Cinta Infinita"
      description="Contrapunto activo con bandas entrelazadas en movimiento"
      className={className}
      badge="Scrolling"
    >
      <canvas ref={canvasRef} className="w-full h-64" style={{ width: "100%", height: "256px" }} />
    </BaseChart>
  )
}
