"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GlobalFilters } from "@/components/filters/global-filters"
import { CompositionalProfile } from "@/components/visualizations/global/compositional-profile"
import { InnovationGauge } from "@/components/visualizations/global/innovation-gauge"
import { ComplexityMeter } from "@/components/visualizations/global/complexity-meter"
import { MetricFingerprint } from "@/components/visualizations/global/metric-fingerprint"
import { RainbowEntropyMap } from "@/components/visualizations/global/rainbow-entropy-map"
import { GoldenRatioTimeline } from "@/components/visualizations/global/golden-ratio-timeline"
import { LoadingChart } from "@/components/visualizations/loading-chart"
import { ErrorChart } from "@/components/visualizations/error-chart"
import { useGlobalMetrics, type MusicDataFilters } from "@/hooks/use-music-data"

export default function GlobalMetricsPage() {
  const [filters, setFilters] = useState<MusicDataFilters>({})
  const { data, error, isLoading } = useGlobalMetrics(filters)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Global Metrics & Comparative Analysis</h1>
          <p className="text-muted-foreground">
            Comprehensive compositional profiling, innovation metrics, and comparative analysis features
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
              <div className="grid gap-6 md:grid-cols-2">
                <CompositionalProfile data={data?.compositionalProfile} />
                <InnovationGauge data={data?.innovationGauge} />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <ComplexityMeter data={data?.complexityMeter} />
                <MetricFingerprint data={data?.metricFingerprint} />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <RainbowEntropyMap data={data?.rainbowEntropyMap} />
                <GoldenRatioTimeline data={data?.goldenRatioTimeline} totalDuration={data?.totalDuration} />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
