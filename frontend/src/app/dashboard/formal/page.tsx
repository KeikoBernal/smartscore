"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GlobalFilters } from "@/components/filters/global-filters"
import { MusicalPuzzle } from "@/components/visualizations/formal/musical-puzzle"
import { MovementPie } from "@/components/visualizations/formal/movement-pie"
import { SymmetryMirror } from "@/components/visualizations/formal/symmetry-mirror"
import { LoadingChart } from "@/components/visualizations/loading-chart"
import { ErrorChart } from "@/components/visualizations/error-chart"
import { useFormalData, type MusicDataFilters } from "@/hooks/use-music-data"

export default function FormalAnalysisPage() {
  const [filters, setFilters] = useState<MusicDataFilters>({})
  const { data, error, isLoading } = useFormalData(filters)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Formal Analysis</h1>
          <p className="text-muted-foreground">Structure segmentation, repetition, and symmetry pattern analysis</p>
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
              <MusicalPuzzle data={data?.musicalPuzzle} />
              <div className="grid gap-6 md:grid-cols-2">
                <MovementPie data={data?.movementPie} />
                <SymmetryMirror data={data?.symmetryMirror} />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
