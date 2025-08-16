"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GlobalFilters } from "@/components/filters/global-filters"
import { DurationFigures } from "@/components/visualizations/rhythmic/duration-figures"
import { PulseWave } from "@/components/visualizations/rhythmic/pulse-wave"
import { PolyrhythmRibbons } from "@/components/visualizations/rhythmic/polyrhythm-ribbons"
import { LoadingChart } from "@/components/visualizations/loading-chart"
import { ErrorChart } from "@/components/visualizations/error-chart"
import { useRhythmicData, type MusicDataFilters } from "@/hooks/use-music-data"

export default function RhythmicAnalysisPage() {
  const [filters, setFilters] = useState<MusicDataFilters>({})
  const { data, error, isLoading } = useRhythmicData(filters)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Rhythmic Analysis</h1>
          <p className="text-muted-foreground">
            Duration patterns, complexity, polyrhythm, and metric regularity analysis
          </p>
        </div>

        <GlobalFilters filters={filters} onFiltersChange={setFilters} />

        <div className="grid gap-6">
          {isLoading ? (
            <>
              <LoadingChart />
              <div className="grid gap-6 md:grid-cols-2">
                <LoadingChart />
                <LoadingChart />
              </div>
            </>
          ) : error ? (
            <ErrorChart error={error} />
          ) : (
            <>
              <DurationFigures data={data?.durationFigures} />
              <div className="grid gap-6 md:grid-cols-2">
                <PulseWave data={data?.pulseWave} />
                <PolyrhythmRibbons data={data?.polyrhythmRibbons} />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
