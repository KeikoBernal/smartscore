"use client"

import { useEffect, useRef } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface FractalTreeProps {
  data?: {
    root: string
    similarity: number
    children: Array<{
      name: string
      similarity: number
      level: number
      children?: Array<{ name: string; similarity: number; level: number }>
    }>
  }
  className?: string
}

export function FractalTree({ data, className }: FractalTreeProps) {
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
    const startY = rect.height - 40

    // Recursive function to draw tree branches
    const drawBranch = (
      x: number,
      y: number,
      angle: number,
      length: number,
      level: number,
      similarity: number,
      name: string,
    ) => {
      if (level > 4 || length < 10) return

      // Calculate end point
      const endX = x + Math.cos(angle) * length
      const endY = y - Math.sin(angle) * length

      // Color based on similarity and level
      let color = MANGO_COLORS.purple
      if (similarity > 0.8) color = MANGO_COLORS.coral
      else if (similarity > 0.6) color = MANGO_COLORS.orange
      else if (similarity > 0.4) color = MANGO_COLORS.yellow
      else if (similarity > 0.2) color = MANGO_COLORS.pink

      // Line thickness based on level and similarity
      const lineWidth = Math.max(1, (5 - level) * similarity * 2)

      // Draw branch
      ctx.strokeStyle = `${color}${Math.floor((0.5 + similarity * 0.5) * 255)
        .toString(16)
        .padStart(2, "0")}`
      ctx.lineWidth = lineWidth
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(endX, endY)
      ctx.stroke()

      // Draw node
      const nodeSize = 3 + similarity * 8
      ctx.beginPath()
      ctx.arc(endX, endY, nodeSize, 0, 2 * Math.PI)
      ctx.fillStyle = `${color}80`
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw label for significant nodes
      if (level <= 2 && similarity > 0.3) {
        ctx.fillStyle = color
        ctx.font = `${Math.max(8, 12 - level * 2)}px sans-serif`
        ctx.textAlign = "center"
        ctx.fillText(name, endX, endY + nodeSize + 15)
      }

      // Draw children branches
      if (level < 4) {
        const childCount = Math.floor(2 + similarity * 3)
        const angleSpread = Math.PI / 3 // 60 degrees spread

        for (let i = 0; i < childCount; i++) {
          const childAngle = angle + (angleSpread * (i - (childCount - 1) / 2)) / (childCount - 1 || 1)
          const childLength = length * (0.6 + similarity * 0.3)
          const childSimilarity = similarity * (0.7 + Math.random() * 0.3)
          const childName = `${name}.${i + 1}`

          drawBranch(endX, endY, childAngle, childLength, level + 1, childSimilarity, childName)
        }
      }
    }

    // Draw root
    ctx.fillStyle = MANGO_COLORS.purple
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(data.root, centerX, startY + 20)

    // Start drawing from root
    drawBranch(centerX, startY, Math.PI / 2, 80, 0, data.similarity, data.root)

    // Draw specific children from data if available
    if (data.children) {
      const angleStep = Math.PI / 2 / (data.children.length + 1)

      data.children.forEach((child, index) => {
        const angle = Math.PI / 2 + angleStep * (index + 1 - data.children.length / 2)
        drawBranch(centerX, startY, angle, 60, 1, child.similarity, child.name)

        // Draw grandchildren
        if (child.children) {
          const childX = centerX + Math.cos(angle) * 60
          const childY = startY - Math.sin(angle) * 60

          child.children.forEach((grandchild, gIndex) => {
            const grandAngle = angle + (Math.PI / 6) * (gIndex - (child.children!.length - 1) / 2)
            drawBranch(childX, childY, grandAngle, 40, 2, grandchild.similarity, grandchild.name)
          })
        }
      })
    }
  }, [data])

  return (
    <BaseChart
      title="Árbol Genealógico"
      description="Fractalidad mostrando estructura de auto-similitud"
      className={className}
      badge="Fractal"
    >
      <canvas ref={canvasRef} className="w-full h-96" style={{ width: "100%", height: "384px" }} />
    </BaseChart>
  )
}
