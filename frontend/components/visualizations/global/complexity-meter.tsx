"use client"

import { useEffect, useRef, useState } from "react"
import { BaseChart } from "../base-chart"
import { MANGO_COLORS } from "@/lib/visualization-utils"

interface ComplexityMeterProps {
  data?: {
    totalComplexity: number
    components: Array<{
      name: string
      value: number
      icon: string
    }>
  }
  className?: string
}

export function ComplexityMeter({ data, className }: ComplexityMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (!data) return

    const rotationSpeed = data.totalComplexity * 2 // Faster rotation for higher complexity
    const rotationInterval = setInterval(() => {
      setRotation((prev) => (prev + rotationSpeed) % 360)
    }, 50)

    return () => clearInterval(rotationInterval)
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

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const outerRadius = Math.min(rect.width, rect.height) / 3
    const innerRadius = outerRadius * 0.6

    // Draw outer ring
    ctx.strokeStyle = `${MANGO_COLORS.purple}40`
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI)
    ctx.stroke()

    // Draw complexity ring
    const complexityAngle = (data.totalComplexity / 100) * 2 * Math.PI
    const gradient = ctx.createConicGradient(0, centerX, centerY)
    gradient.addColorStop(0, MANGO_COLORS.yellow)
    gradient.addColorStop(0.25, MANGO_COLORS.orange)
    gradient.addColorStop(0.5, MANGO_COLORS.coral)
    gradient.addColorStop(0.75, MANGO_COLORS.pink)
    gradient.addColorStop(1, MANGO_COLORS.purple)

    ctx.strokeStyle = gradient
    ctx.lineWidth = 12
    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius, -Math.PI / 2, -Math.PI / 2 + complexityAngle)
    ctx.stroke()

    // Draw rotating potentiometer knob
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((rotation * Math.PI) / 180)

    // Knob body
    ctx.fillStyle = `${MANGO_COLORS.purple}80`
    ctx.beginPath()
    ctx.arc(0, 0, innerRadius, 0, 2 * Math.PI)
    ctx.fill()

    ctx.strokeStyle = MANGO_COLORS.purple
    ctx.lineWidth = 3
    ctx.stroke()

    // Knob indicator
    ctx.strokeStyle = MANGO_COLORS.coral
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(0, -innerRadius * 0.8)
    ctx.lineTo(0, -innerRadius * 0.4)
    ctx.stroke()

    ctx.restore()

    // Draw musical icons around the meter
    const icons = ["♪", "♫", "♬", "♭", "♯", "𝄞", "𝄢", "𝄡"]
    data.components.forEach((component, index) => {
      const angle = (index / data.components.length) * 2 * Math.PI
      const iconRadius = outerRadius + 30
      const x = centerX + Math.cos(angle) * iconRadius
      const y = centerY + Math.sin(angle) * iconRadius

      // Icon size based on component value
      const iconSize = 12 + (component.value / Math.max(...data.components.map((c) => c.value))) * 8

      ctx.fillStyle = MANGO_COLORS.coral
      ctx.font = `${iconSize}px serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(icons[index % icons.length], x, y)

      // Component label
      ctx.fillStyle = MANGO_COLORS.purple
      ctx.font = "10px sans-serif"
      ctx.fillText(component.name, x, y + 20)
    })

    // Draw center value
    ctx.fillStyle = MANGO_COLORS.purple
    ctx.font = "20px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${data.totalComplexity.toFixed(1)}`, centerX, centerY)

    ctx.font = "12px sans-serif"
    ctx.fillText("Complexity", centerX, centerY + 20)
  }, [data, rotation])

  return (
    <BaseChart
      title="Medidor de Energía"
      description="Complejidad total con potenciómetro giratorio e iconos musicales"
      className={className}
      badge="Rotating"
    >
      <canvas ref={canvasRef} className="w-full h-80" style={{ width: "100%", height: "320px" }} />
    </BaseChart>
  )
}
