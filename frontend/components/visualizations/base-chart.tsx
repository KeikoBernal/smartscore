"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart-container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Maximize2 } from "lucide-react"
import type { ReactNode } from "react"

interface BaseChartProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  badge?: string
  onExport?: () => void
  onFullscreen?: () => void
}

export function BaseChart({ title, description, children, className, badge, onExport, onFullscreen }: BaseChartProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              {badge && (
                <Badge variant="secondary" className="bg-mango-coral/20 text-mango-coral">
                  {badge}
                </Badge>
              )}
            </div>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-1">
            {onExport && (
              <Button variant="ghost" size="icon" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            {onFullscreen && (
              <Button variant="ghost" size="icon" onClick={onFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer>{children}</ChartContainer>
      </CardContent>
    </Card>
  )
}
