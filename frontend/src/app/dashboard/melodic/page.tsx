"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GlobalFilters } from "@/components/filters/global-filters"
import { IntervalLadder } from "@/components/visualizations/melodic/interval-ladder"
import { AmbitusThermometer } from "@/components/visualizations/melodic/ambitus-thermometer"
import { MelodicEntropySpiral } from "@/components/visualizations/melodic/melodic-entropy-spiral"
import { LoadingChart } from "@/components/visualizations/loading-chart"
import { ErrorChart } from "@/components/visualizations/error-chart"
import { useMelodicData, type MusicDataFilters } from "@/hooks/use-music-data"

export default function MelodicAnalysisPage() {
  const [filters, setFilters] = useState<MusicDataFilters>({})
  const { data, error, isLoading } = useMelodicData(filters)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Melodic Analysis</h1>
          <p className="text-muted-foreground">Intervals, motifs, ambitus, and melodic entropy pattern analysis</p>
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
                <IntervalLadder data={data?.intervalLadder} />
                <AmbitusThermometer data={data?.ambitus} />
              </div>
              <MelodicEntropySpiral data={data?.entropySpiral} />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
