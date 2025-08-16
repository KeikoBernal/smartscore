"use client"

import { useEffect, useRef } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface AmbitusThermometerProps {
  data?: { minPitch: number; maxPitch: number; averagePitch: number }
  className?: string
}

export function AmbitusThermometer({ data, className }: AmbitusThermometerProps) {
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

    // Thermometer dimensions
    const thermometerWidth = 40
    const thermometerHeight = rect.height - 60
    const x = rect.width / 2 - thermometerWidth / 2
    const y = 30

    // MIDI note range (typically 21-108 for piano)
    const midiMin = 21
    const midiMax = 108
    const range = midiMax - midiMin

    // Calculate positions
    const minPos = y + thermometerHeight - ((data.minPitch - midiMin) / range) * thermometerHeight
    const maxPos = y + thermometerHeight - ((data.maxPitch - midiMin) / range) * thermometerHeight
    const avgPos = y + thermometerHeight - ((data.averagePitch - midiMin) / range) * thermometerHeight

    // Draw thermometer outline
    ctx.strokeStyle = MANGO_COLORS.purple
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, thermometerWidth, thermometerHeight)

    // Draw filled area (ambitus range)
    const gradient = ctx.createLinearGradient(0, maxPos, 0, minPos)
    gradient.addColorStop(0, MANGO_COLORS.purple)
    gradient.addColorStop(0.5, MANGO_COLORS.coral)
    gradient.addColorStop(1, MANGO_COLORS.yellow)

    ctx.fillStyle = gradient
    ctx.fillRect(x + 2, maxPos, thermometerWidth - 4, minPos - maxPos)

    // Draw average line
    ctx.strokeStyle = MANGO_COLORS.orange
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x - 5, avgPos)
    ctx.lineTo(x + thermometerWidth + 5, avgPos)
    ctx.stroke()

    // Draw labels
    ctx.fillStyle = MANGO_COLORS.purple
    ctx.font = "12px sans-serif"
    ctx.textAlign = "left"

    ctx.fillText(`Max: ${data.maxPitch}`, x + thermometerWidth + 10, maxPos + 5)
    ctx.fillText(`Avg: ${data.averagePitch}`, x + thermometerWidth + 10, avgPos + 5)
    ctx.fillText(`Min: ${data.minPitch}`, x + thermometerWidth + 10, minPos + 5)

    // Draw scale marks
    ctx.strokeStyle = `${MANGO_COLORS.purple}60`
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const markY = y + (i / 10) * thermometerHeight
      ctx.beginPath()
      ctx.moveTo(x - 5, markY)
      ctx.lineTo(x, markY)
      ctx.stroke()

      const midiValue = midiMax - (i / 10) * range
      ctx.fillStyle = `${MANGO_COLORS.purple}80`
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(Math.round(midiValue).toString(), x - 8, markY + 3)
    }
  }, [data])

  return (
    <BaseChart
      title="Termómetro de Tesitura"
      description="Rango de alturas (ambitus) de la composición"
      className={className}
      badge="Gauge"
    >
      <canvas ref={canvasRef} className="w-full h-80" style={{ width: "100%", height: "320px" }} />
    </BaseChart>
  )
}
