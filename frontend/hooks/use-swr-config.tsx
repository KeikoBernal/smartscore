"use client"

import { SWRConfig } from "swr"
import type { ReactNode } from "react"

const fetcher = async (url: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  const response = await fetch(`${baseUrl}${url}`)

  if (!response.ok) {
    throw new Error("Failed to fetch data")
  }

  return response.json()
}

interface SWRProviderProps {
  children: ReactNode
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        refreshInterval: 30000, // Refresh every 30 seconds
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
