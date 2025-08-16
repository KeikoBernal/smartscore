"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GlobalFilters } from "@/components/filters/global-filters"
import { ChordProgressionPath } from "@/components/visualizations/harmonic/chord-progression-path"
import { HarmonicTensionWaves } from "@/components/visualizations/harmonic/harmonic-tension-waves"
import { ChordGarden } from "@/components/visualizations/harmonic/chord-garden"
import { LoadingChart } from "@/components/visualizations/loading-chart"
import { ErrorChart } from "@/components/visualizations/error-chart"
import { useHarmonicData, type MusicDataFilters } from "@/hooks/use-music-data"

export default function HarmonicAnalysisPage() {
  const [filters, setFilters] = useState<MusicDataFilters>({})
  const { data, error, isLoading } = useHarmonicData(filters)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Harmonic Analysis</h1>
          <p className="text-muted-foreground">
            Chord progressions, tension, modulations, and harmonic entropy analysis
          </p>
        </div>

        <GlobalFilters filters={filters} onFiltersChange={setFilters} />

        <div className="grid gap-6">
          {isLoading ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <LoadingChart />
                <LoadingChart />
              </div>
              <LoadingChart />
            </>
          ) : error ? (
            <ErrorChart error={error} />
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <ChordProgressionPath data={data?.chordProgression} />
                <HarmonicTensionWaves data={data?.tensionWaves} />
              </div>
              <ChordGarden data={data?.chordGarden} />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
