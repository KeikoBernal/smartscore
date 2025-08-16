"use client"

import { cn } from "@/lib/utils"

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    color: string
    dataKey: string
    name: string
    value: any
    payload: any
  }>
  label?: string
  className?: string
}

export function ChartTooltip({ active, payload, label, className }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={cn("rounded-lg border bg-background p-2 shadow-md", className)}>
      {label && <div className="mb-2 font-medium">{label}</div>}
      <div className="grid gap-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-muted-foreground">{entry.name}:</span>
            <span className="text-sm font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
