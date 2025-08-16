"use client"

import { useEffect, useRef } from "react"
import { BaseChart } from "../base-chart"
import { generateOrchestraSeating, MANGO_COLORS } from "@/lib/visualization-utils"

interface MusicalWeaveProps {
  data?: Array<{
    section1: string
    section2: string
    connectionType: "homophony" | "counterpoint" | "unison"
    strength: number
  }>
  className?: string
}

export function MusicalWeave({ data, className }: MusicalWeaveProps) {
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

    // Draw section positions
    const sectionCenters = new Map()
    const sections = ["strings", "woodwinds", "brass", "percussion"]

    sections.forEach((section, index) => {
      const sectionInstruments = seatingPositions.filter((pos) => pos.section === section)
      const centerX = (sectionInstruments.reduce((sum, pos) => sum + pos.x, 0) / sectionInstruments.length) * rect.width
      const centerY =
        (sectionInstruments.reduce((sum, pos) => sum + pos.y, 0) / sectionInstruments.length) * rect.height

      sectionCenters.set(section, { x: centerX, y: centerY })

      // Draw section circle
      let color = MANGO_COLORS.purple
      switch (section) {
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

      ctx.beginPath()
      ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI)
      ctx.fillStyle = `${color}40`
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw section label
      ctx.fillStyle = color
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(section, centerX, centerY + 5)
    })

    // Draw connections
    data.forEach((connection) => {
      const pos1 = sectionCenters.get(connection.section1)
      const pos2 = sectionCenters.get(connection.section2)

      if (!pos1 || !pos2) return

      // Line style based on connection type
      let color = MANGO_COLORS.purple
      let lineStyle = "solid"

      switch (connection.connectionType) {
        case "homophony":
          color = MANGO_COLORS.coral
          lineStyle = "solid"
          break
        case "counterpoint":
          color = MANGO_COLORS.orange
          lineStyle = "dashed"
          break
        case "unison":
          color = MANGO_COLORS.yellow
          lineStyle = "dotted"
          break
      }

      // Line thickness based on strength
      const lineWidth = 1 + connection.strength * 5

      ctx.strokeStyle = `${color}${Math.floor(connection.strength * 255)
        .toString(16)
        .padStart(2, "0")}`
      ctx.lineWidth = lineWidth

      if (lineStyle === "dashed") {
        ctx.setLineDash([10, 5])
      } else if (lineStyle === "dotted") {
        ctx.setLineDash([3, 3])
      } else {
        ctx.setLineDash([])
      }

      ctx.beginPath()
      ctx.moveTo(pos1.x, pos1.y)
      ctx.lineTo(pos2.x, pos2.y)
      ctx.stroke()
    })

    // Reset line dash
    ctx.setLineDash([])
  }, [data])

  return (
    <BaseChart
      title="Tejido Musical"
      description="Red de conexiones entre secciones según homofonía vs contrapunto"
      className={className}
      badge="Network"
    >
      <canvas ref={canvasRef} className="w-full h-80" style={{ width: "100%", height: "320px" }} />
    </BaseChart>
  )
}
