"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Filter, X } from "lucide-react"
import type { MusicDataFilters } from "@/hooks/use-music-data"

interface GlobalFiltersProps {
  filters: MusicDataFilters
  onFiltersChange: (filters: MusicDataFilters) => void
  className?: string
}

const availableMetrics = [
  "instrumental_density",
  "melodic_entropy",
  "rhythmic_complexity",
  "harmonic_tension",
  "textural_balance",
  "formal_symmetry",
]

export function GlobalFilters({ filters, onFiltersChange, className }: GlobalFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value,
      } as { start: string; end: string },
    })
  }

  const handleMetricToggle = (metric: string) => {
    const currentMetrics = filters.metrics || []
    const newMetrics = currentMetrics.includes(metric)
      ? currentMetrics.filter((m) => m !== metric)
      : [...currentMetrics, metric]

    onFiltersChange({
      ...filters,
      metrics: newMetrics,
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const activeFiltersCount = [
    filters.dateRange?.start,
    filters.dateRange?.end,
    filters.metrics?.length,
    filters.composer,
    filters.genre,
  ].filter(Boolean).length

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Global Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-mango-coral/20 text-mango-coral">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={filters.dateRange?.start || ""}
                onChange={(e) => handleDateRangeChange("start", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.dateRange?.end || ""}
                onChange={(e) => handleDateRangeChange("end", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Composer</Label>
            <Select
              value={filters.composer || ""}
              onValueChange={(value) => onFiltersChange({ ...filters, composer: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select composer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bach">J.S. Bach</SelectItem>
                <SelectItem value="mozart">W.A. Mozart</SelectItem>
                <SelectItem value="beethoven">L. van Beethoven</SelectItem>
                <SelectItem value="chopin">F. Chopin</SelectItem>
                <SelectItem value="debussy">C. Debussy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Genre</Label>
            <Select
              value={filters.genre || ""}
              onValueChange={(value) => onFiltersChange({ ...filters, genre: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classical">Classical</SelectItem>
                <SelectItem value="romantic">Romantic</SelectItem>
                <SelectItem value="baroque">Baroque</SelectItem>
                <SelectItem value="contemporary">Contemporary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Metrics</Label>
            <div className="flex flex-wrap gap-2">
              {availableMetrics.map((metric) => (
                <Button
                  key={metric}
                  variant={filters.metrics?.includes(metric) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMetricToggle(metric)}
                  className={filters.metrics?.includes(metric) ? "bg-mango-purple hover:bg-mango-purple/80" : ""}
                >
                  {metric.replace("_", " ")}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
