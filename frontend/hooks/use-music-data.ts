"use client"

import useSWR from "swr"
import { useMemo } from "react"

export interface MusicDataFilters {
  dateRange?: {
    start: string
    end: string
  }
  metrics?: string[]
  composer?: string
  genre?: string
}

export function useMusicData(endpoint: string, filters?: MusicDataFilters) {
  const queryParams = useMemo(() => {
    if (!filters) return ""

    const params = new URLSearchParams()

    if (filters.dateRange) {
      params.append("start_date", filters.dateRange.start)
      params.append("end_date", filters.dateRange.end)
    }

    if (filters.metrics?.length) {
      params.append("metrics", filters.metrics.join(","))
    }

    if (filters.composer) {
      params.append("composer", filters.composer)
    }

    if (filters.genre) {
      params.append("genre", filters.genre)
    }

    return params.toString() ? `?${params.toString()}` : ""
  }, [filters])

  const { data, error, isLoading, mutate } = useSWR(`${endpoint}${queryParams}`, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  })

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}

export function useInstrumentalData(filters?: MusicDataFilters) {
  return useMusicData("/api/analysis/instrumental", filters)
}

export function useMelodicData(filters?: MusicDataFilters) {
  return useMusicData("/api/analysis/melodic", filters)
}

export function useRhythmicData(filters?: MusicDataFilters) {
  return useMusicData("/api/analysis/rhythmic", filters)
}

export function useHarmonicData(filters?: MusicDataFilters) {
  return useMusicData("/api/analysis/harmonic", filters)
}

export function useTexturalData(filters?: MusicDataFilters) {
  return useMusicData("/api/analysis/textural", filters)
}

export function useFormalData(filters?: MusicDataFilters) {
  return useMusicData("/api/analysis/formal", filters)
}

export function useInteractionData(filters?: MusicDataFilters) {
  return useMusicData("/api/analysis/interaction", filters)
}

export function useGlobalMetrics(filters?: MusicDataFilters) {
  return useMusicData("/api/analysis/global", filters)
}
