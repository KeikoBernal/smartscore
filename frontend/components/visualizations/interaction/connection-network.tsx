"use client"

import { useEffect, useRef } from "react"
import { BaseChart } from "../base-chart"
import { generateOrchestraSeating, MANGO_COLORS } from "@/lib/visualization-utils"

interface ConnectionNetworkProps {
  data?: Array<{
    source: string
    target: string
    coOccurrence: number
    interactionType: "melodic" | "rhythmic" | "harmonic"
  }>
  className?: string
}

export function ConnectionNetwork({ data, className }: ConnectionNetworkProps) {
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
    const nodePositions = new Map()

    // Create node positions
    seatingPositions.forEach((position) => {
      const x = position.x * rect.width
      const y = position.y * rect.height
      nodePositions.set(position.instrument, { x, y, section: position.section })
    })

    // Draw connections first (so they appear behind nodes)
    data.forEach((connection) => {
      const sourcePos = nodePositions.get(connection.source)
      const targetPos = nodePositions.get(connection.target)

      if (!sourcePos || !targetPos) return

      // Line thickness based on co-occurrence
      const lineWidth = 1 + connection.coOccurrence * 8

      // Color based on interaction type
      let color = MANGO_COLORS.purple
      switch (connection.interactionType) {
        case "melodic":
          color = MANGO_COLORS.coral
          break
        case "rhythmic":
          color = MANGO_COLORS.orange
          break
        case "harmonic":
          color = MANGO_COLORS.yellow
          break
      }

      // Draw connection line
      ctx.strokeStyle = `${color}${Math.floor(connection.coOccurrence * 255)
        .toString(16)
        .padStart(2, "0")}`
      ctx.lineWidth = lineWidth

      ctx.beginPath()
      ctx.moveTo(sourcePos.x, sourcePos.y)
      ctx.lineTo(targetPos.x, targetPos.y)
      ctx.stroke()

      // Draw arrow head
      const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x)
      const arrowLength = 10 + connection.coOccurrence * 5
      const arrowAngle = Math.PI / 6

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(targetPos.x, targetPos.y)
      ctx.lineTo(
        targetPos.x - arrowLength * Math.cos(angle - arrowAngle),
        targetPos.y - arrowLength * Math.sin(angle - arrowAngle),
      )
      ctx.lineTo(
        targetPos.x - arrowLength * Math.cos(angle + arrowAngle),
        targetPos.y - arrowLength * Math.sin(angle + arrowAngle),
      )
      ctx.closePath()
      ctx.fill()
    })

    // Draw nodes
    nodePositions.forEach((position, instrument) => {
      // Node size based on number of connections
      const connectionCount = data.filter((d) => d.source === instrument || d.target === instrument).length
      const nodeSize = 8 + connectionCount * 2

      // Color based on section
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

      // Draw node
      ctx.beginPath()
      ctx.arc(position.x, position.y, nodeSize, 0, 2 * Math.PI)
      ctx.fillStyle = `${color}80`
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw label
      ctx.fillStyle = color
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(instrument, position.x, position.y + nodeSize + 15)
    })
  }, [data])

  return (
    <BaseChart
      title="Mapa de Conexiones"
      description="Red de interacción con nodos como asientos y flechas según co-ocurrencia"
      className={className}
      badge="Network"
    >
      <canvas ref={canvasRef} className="w-full h-96" style={{ width: "100%", height: "384px" }} />
    </BaseChart>
  )
}
