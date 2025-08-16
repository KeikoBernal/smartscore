"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GlobalFilters } from "@/components/filters/global-filters"
import { ConnectionNetwork } from "@/components/visualizations/interaction/connection-network"
import { ThematicSimultaneity } from "@/components/visualizations/interaction/thematic-simultaneity"
import { InfiniteRibbon } from "@/components/visualizations/interaction/infinite-ribbon"
import { AnimatedMosaic } from "@/components/visualizations/interaction/animated-mosaic"
import { FractalTree } from "@/components/visualizations/interaction/fractal-tree"
import { LoadingChart } from "@/components/visualizations/loading-chart"
import { ErrorChart } from "@/components/visualizations/error-chart"
import { useInteractionData, type MusicDataFilters } from "@/hooks/use-music-data"

export default function InteractionAnalysisPage() {
  const [filters, setFilters] = useState<MusicDataFilters>({})
  const { data, error, isLoading } = useInteractionData(filters)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Interaction & Complexity Analysis</h1>
          <p className="text-muted-foreground">
            Network interactions, thematic simultaneity, counterpoint, and fractal structure analysis
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
              <div className="grid gap-6 md:grid-cols-2">
                <LoadingChart />
                <LoadingChart />
              </div>
            </>
          ) : error ? (
            <ErrorChart error={error} />
          ) : (
            <>
              <ConnectionNetwork data={data?.connectionNetwork} />
              <div className="grid gap-6 md:grid-cols-2">
                <ThematicSimultaneity data={data?.thematicSimultaneity} />
                <InfiniteRibbon data={data?.infiniteRibbon} />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <AnimatedMosaic data={data?.animatedMosaic} />
                <FractalTree data={data?.fractalTree} />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
