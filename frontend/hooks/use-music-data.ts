"use client"

import useSWR from "swr"
import { useMemo } from "react"
import { API_BASE_URL } from "../config"

export interface MusicDataFilters {
  dateRange?: {
    start: string
    end: string
  }
  metrics?: string[]
  composer?: string
  genre?: string
}

const fetcher = async (url: string) => {
  const response = await fetch(`${API_BASE_URL}${url}`)
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }
  return response.json()
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

  const { data, error, isLoading, mutate } = useSWR(
    `${endpoint}${queryParams}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minuto
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}

export function useInstrumentalData(filters?: MusicDataFilters) {
  return useMusicData("/analysis/instrumental", filters)
}

export function useMelodicData(filters?: MusicDataFilters) {
  return useMusicData("/analysis/melodic", filters)
}

export function useRhythmicData(filters?: MusicDataFilters) {
  return useMusicData("/analysis/rhythmic", filters)
}

export function useHarmonicData(filters?: MusicDataFilters) {
  return useMusicData("/analysis/harmonic", filters)
}

export function useTexturalData(filters?: MusicDataFilters) {
  return useMusicData("/analysis/textural", filters)
}

export function useFormalData(filters?: MusicDataFilters) {
  return useMusicData("/analysis/formal", filters)
}

export function useInteractionData(filters?: MusicDataFilters) {
  return useMusicData("/analysis/interaction", filters)
}

export function useGlobalMetrics(filters?: MusicDataFilters) {
  return useMusicData("/analysis/global", filters)
}

export function useDifferentiatingData(filters?: MusicDataFilters) {
  return useMusicData("/analysis/differentiating", filters)
}

export function useFileMetrics(fileId: string, category?: string) {
  const endpoint = category
    ? `/files/${fileId}/${category}`
    : `/files/${fileId}/metrics`
  return useMusicData(endpoint)
}

export function useFileUpload() {
  const uploadFiles = async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  return { uploadFiles }
}