"use client"

import { useEffect, useRef, useState } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface AnimatedMosaicProps {
  data?: Array<{
    combination: string
    diversity: number
    frequency: number
    x: number
    y: number
  }>
  className?: string
}

export function AnimatedMosaic({ data, className }: AnimatedMosaicProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationFrame, setAnimationFrame] = useState(0)

  useEffect(() => {
    if (!data) return

    const animationInterval = setInterval(() => {
      setAnimationFrame((prev) => prev + 1)
    }, 100)

    return () => clearInterval(animationInterval)
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

    const tileSize = 40
    const cols = Math.floor(rect.width / tileSize)
    const rows = Math.floor(rect.height / tileSize)

    // Create animated mosaic tiles
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * tileSize
        const y = row * tileSize

        // Find corresponding data point or create procedural tile
        const dataPoint = data.find((d) => Math.floor(d.x * cols) === col && Math.floor(d.y * rows) === row)

        let diversity = dataPoint?.diversity || Math.random() * 0.5
        const frequency = dataPoint?.frequency || Math.random() * 0.3

        // Add animation variation
        const animationOffset = Math.sin(animationFrame * 0.1 + col * 0.2 + row * 0.3) * 0.2
        diversity = Math.max(0, Math.min(1, diversity + animationOffset))

        // Color based on diversity
        let color = MANGO_COLORS.purple
        if (diversity > 0.8) color = MANGO_COLORS.coral
        else if (diversity > 0.6) color = MANGO_COLORS.orange
        else if (diversity > 0.4) color = MANGO_COLORS.yellow
        else if (diversity > 0.2) color = MANGO_COLORS.pink

        // Alpha based on frequency
        const alpha = Math.floor((0.3 + frequency * 0.7) * 255)
          .toString(16)
          .padStart(2, "0")

        // Draw tile with animated size variation
        const sizeVariation = 1 + Math.sin(animationFrame * 0.05 + col + row) * 0.1
        const tileWidth = tileSize * 0.9 * sizeVariation
        const tileHeight = tileSize * 0.9 * sizeVariation
        const offsetX = (tileSize - tileWidth) / 2
        const offsetY = (tileSize - tileHeight) / 2

        ctx.fillStyle = `${color}${alpha}`
        ctx.fillRect(x + offsetX, y + offsetY, tileWidth, tileHeight)

        // Add pattern based on combination type
        if (dataPoint) {
          ctx.strokeStyle = color
          ctx.lineWidth = 1

          // Different patterns for different combinations
          if (dataPoint.combination.includes("melodic")) {
            // Wave pattern
            ctx.beginPath()
            for (let i = 0; i < tileWidth; i += 4) {
              const waveY = y + offsetY + tileHeight / 2 + Math.sin((i / tileWidth) * 4 * Math.PI) * (tileHeight / 6)
              if (i === 0) ctx.moveTo(x + offsetX + i, waveY)
              else ctx.lineTo(x + offsetX + i, waveY)
            }
            ctx.stroke()
          } else if (dataPoint.combination.includes("rhythmic")) {
            // Dot pattern
            for (let i = 0; i < 3; i++) {
              for (let j = 0; j < 3; j++) {
                ctx.beginPath()
                ctx.arc(
                  x + offsetX + (i + 1) * (tileWidth / 4),
                  y + offsetY + (j + 1) * (tileHeight / 4),
                  2,
                  0,
                  2 * Math.PI,
                )
                ctx.fill()
              }
            }
          } else if (dataPoint.combination.includes("harmonic")) {
            // Grid pattern
            ctx.beginPath()
            for (let i = 1; i < 4; i++) {
              ctx.moveTo(x + offsetX + (i * tileWidth) / 4, y + offsetY)
              ctx.lineTo(x + offsetX + (i * tileWidth) / 4, y + offsetY + tileHeight)
              ctx.moveTo(x + offsetX, y + offsetY + (i * tileHeight) / 4)
              ctx.lineTo(x + offsetX + tileWidth, y + offsetY + (i * tileHeight) / 4)
            }
            ctx.stroke()
          }
        }
      }
    }
  }, [data, animationFrame])

  return (
    <BaseChart
      title="Mosaico Animado"
      description="Entropía de interacción con color y variaciones según diversidad"
      className={className}
      badge="Animated"
    >
      <canvas ref={canvasRef} className="w-full h-80" style={{ width: "100%", height: "320px" }} />
    </BaseChart>
  )
}
