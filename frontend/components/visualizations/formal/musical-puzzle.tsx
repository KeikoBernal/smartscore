"use client"

import { useEffect, useRef } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface MusicalPuzzleProps {
  data?: Array<{
    section: string
    startTime: number
    duration: number
    theme: string
    connections: string[]
  }>
  className?: string
}

export function MusicalPuzzle({ data, className }: MusicalPuzzleProps) {
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

    // Calculate total duration
    const totalDuration = Math.max(...data.map((d) => d.startTime + d.duration))
    const timelineY = rect.height / 2
    const pieceHeight = 60

    // Draw timeline
    ctx.strokeStyle = `${MANGO_COLORS.purple}40`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(20, timelineY)
    ctx.lineTo(rect.width - 20, timelineY)
    ctx.stroke()

    // Color mapping for themes
    const themeColors = new Map()
    const themes = [...new Set(data.map((d) => d.theme))]
    themes.forEach((theme, index) => {
      const colors = [
        MANGO_COLORS.purple,
        MANGO_COLORS.coral,
        MANGO_COLORS.orange,
        MANGO_COLORS.yellow,
        MANGO_COLORS.pink,
      ]
      themeColors.set(theme, colors[index % colors.length])
    })

    // Draw puzzle pieces
    data.forEach((section, index) => {
      const x = 20 + (section.startTime / totalDuration) * (rect.width - 40)
      const width = (section.duration / totalDuration) * (rect.width - 40)
      const y = timelineY - pieceHeight / 2
      const color = themeColors.get(section.theme) || MANGO_COLORS.purple

      // Draw puzzle piece shape
      ctx.fillStyle = `${color}80`
      ctx.strokeStyle = color
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.moveTo(x, y)

      // Top edge with puzzle tabs/blanks
      const tabWidth = width / 4
      for (let i = 0; i < 4; i++) {
        const tabX = x + i * tabWidth
        const hasTab = (index + i) % 2 === 0

        if (hasTab) {
          // Draw tab
          ctx.lineTo(tabX + tabWidth * 0.3, y)
          ctx.arc(tabX + tabWidth * 0.5, y - 8, 8, Math.PI, 0, false)
          ctx.lineTo(tabX + tabWidth * 0.7, y)
        }
        ctx.lineTo(tabX + tabWidth, y)
      }

      // Right edge
      ctx.lineTo(x + width, y + pieceHeight)

      // Bottom edge with puzzle tabs/blanks
      for (let i = 3; i >= 0; i--) {
        const tabX = x + i * tabWidth
        const hasTab = (index + i + 1) % 2 === 0

        ctx.lineTo(tabX + tabWidth, y + pieceHeight)
        if (hasTab) {
          // Draw blank
          ctx.lineTo(tabX + tabWidth * 0.7, y + pieceHeight)
          ctx.arc(tabX + tabWidth * 0.5, y + pieceHeight + 8, 8, 0, Math.PI, false)
          ctx.lineTo(tabX + tabWidth * 0.3, y + pieceHeight)
        }
      }

      // Left edge
      ctx.lineTo(x, y)
      ctx.closePath()

      ctx.fill()
      ctx.stroke()

      // Draw section label
      ctx.fillStyle = color
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(section.section, x + width / 2, y + pieceHeight / 2 + 5)

      // Draw theme indicator
      ctx.fillStyle = `${color}60`
      ctx.font = "10px sans-serif"
      ctx.fillText(section.theme, x + width / 2, y + pieceHeight / 2 - 10)
    })

    // Draw time markers
    ctx.fillStyle = MANGO_COLORS.purple
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"

    for (let i = 0; i <= 10; i++) {
      const time = (i / 10) * totalDuration
      const x = 20 + (i / 10) * (rect.width - 40)

      ctx.beginPath()
      ctx.moveTo(x, timelineY - 5)
      ctx.lineTo(x, timelineY + 5)
      ctx.stroke()

      ctx.fillText(`${Math.round(time)}s`, x, timelineY + 20)
    }
  }, [data])

  return (
    <BaseChart
      title="Rompecabezas Musical"
      description="Segmentación formal como piezas encajadas en línea de tiempo"
      className={className}
      badge="Puzzle"
    >
      <canvas ref={canvasRef} className="w-full h-64" style={{ width: "100%", height: "256px" }} />
    </BaseChart>
  )
}
