"use client"

import { useEffect, useRef, useState } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface PulseWaveProps {
  data?: Array<{ measure: number; complexity: number; variance: number }>
  className?: string
}

export function PulseWave({ data, className }: PulseWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationFrame, setAnimationFrame] = useState(0)

  useEffect(() => {
    if (!canvasRef.current || !data) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height)

      const barWidth = rect.width / data.length
      const maxHeight = rect.height - 40

      data.forEach((item, index) => {
        const x = index * barWidth
        const baseHeight = (item.complexity / Math.max(...data.map((d) => d.complexity))) * maxHeight

        // Add wave animation based on variance
        const waveOffset = Math.sin(animationFrame * 0.1 + index * 0.5) * (item.variance * 10)
        const height = Math.max(5, baseHeight + waveOffset)

        // Color intensity based on complexity
        const intensity = item.complexity / Math.max(...data.map((d) => d.complexity))
        const color = intensity > 0.7 ? MANGO_COLORS.coral : intensity > 0.4 ? MANGO_COLORS.orange : MANGO_COLORS.yellow

        // Draw pulsing bar
        ctx.fillStyle = `${color}${Math.floor((0.5 + intensity * 0.5) * 255)
          .toString(16)
          .padStart(2, "0")}`
        ctx.fillRect(x + 2, rect.height - height - 20, barWidth - 4, height)

        // Draw outline
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.strokeRect(x + 2, rect.height - height - 20, barWidth - 4, height)

        // Draw measure number
        ctx.fillStyle = MANGO_COLORS.purple
        ctx.font = "10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(item.measure.toString(), x + barWidth / 2, rect.height - 5)
      })

      setAnimationFrame((prev) => prev + 1)
    }

    const intervalId = setInterval(animate, 50)
    return () => clearInterval(intervalId)
  }, [data, animationFrame])

  return (
    <BaseChart
      title="Barra de Pulso Ondulante"
      description="Complejidad rítmica con altura según varianza por compás"
      className={className}
      badge="Animated"
    >
      <canvas ref={canvasRef} className="w-full h-64" style={{ width: "100%", height: "256px" }} />
    </BaseChart>
  )
}
