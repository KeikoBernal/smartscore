"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GlobalFilters } from "@/components/filters/global-filters"
import { MusicalWeave } from "@/components/visualizations/textural/musical-weave"
import { VoiceTower } from "@/components/visualizations/textural/voice-tower"
import { SpatialRegisterMap } from "@/components/visualizations/textural/spatial-register-map"
import { LoadingChart } from "@/components/visualizations/loading-chart"
import { ErrorChart } from "@/components/visualizations/error-chart"
import { useTexturalData, type MusicDataFilters } from "@/hooks/use-music-data"

export default function TexturalAnalysisPage() {
  const [filters, setFilters] = useState<MusicDataFilters>({})
  const { data, error, isLoading } = useTexturalData(filters)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Textural Analysis</h1>
          <p className="text-muted-foreground">
            Voice distribution, spatial mapping, and dynamic balance visualization
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
              <MusicalWeave data={data?.musicalWeave} />
              <div className="grid gap-6 md:grid-cols-2">
                <VoiceTower data={data?.voiceTower} />
                <SpatialRegisterMap data={data?.spatialRegister} />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
