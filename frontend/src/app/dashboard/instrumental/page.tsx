"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GlobalFilters } from "@/components/filters/global-filters"
import { OrchestraDensityMap } from "@/components/visualizations/instrumental/orchestra-density-map"
import { ParticipationRoses } from "@/components/visualizations/instrumental/participation-roses"
import { FamilyDistribution } from "@/components/visualizations/instrumental/family-distribution"
import { LoadingChart } from "@/components/visualizations/loading-chart"
import { ErrorChart } from "@/components/visualizations/error-chart"
import { useInstrumentalData, type MusicDataFilters } from "@/hooks/use-music-data"

export default function InstrumentalAnalysisPage() {
  const [filters, setFilters] = useState<MusicDataFilters>({})
  const { data, error, isLoading } = useInstrumentalData(filters)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Instrumental Analysis</h1>
          <p className="text-muted-foreground">
            Orchestra mapping, participation patterns, and instrumental density visualization
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
              <OrchestraDensityMap data={data?.orchestraDensity} />
              <div className="grid gap-6 md:grid-cols-2">
                <ParticipationRoses data={data?.participationRoses} />
                <FamilyDistribution data={data?.familyDistribution} />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
