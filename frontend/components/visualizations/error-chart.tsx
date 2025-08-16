"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorChartProps {
  title?: string
  error: Error
  onRetry?: () => void
  className?: string
}

export function ErrorChart({ title = "Visualization Error", error, onRetry, className }: ErrorChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {error.message || "An error occurred while loading the visualization."}
        </p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="w-full bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
