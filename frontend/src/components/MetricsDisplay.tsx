"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { obtenerMetricasPorCategoria } from "../services/api"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MetricsDisplayProps {
  fileName: string
  category: string
  mode: "global" | "compases" | "mixtas" | "todos"
  instrument: string
}

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6b7280"]

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ fileName, category, mode, instrument }) => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await obtenerMetricasPorCategoria(fileName, category, instrument, mode)
        setData(response.data)
      } catch (err: any) {
        setError(err.response?.data?.error || "Error al cargar las métricas")
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [fileName, category, mode, instrument])

  const renderChart = (metricName: string, metricData: any) => {
    if (!metricData || typeof metricData !== "object") return null

    // Handle array data for line/bar charts
    if (Array.isArray(metricData)) {
      const chartData = metricData.map((value, index) => ({
        index: index + 1,
        value: typeof value === "number" ? value : 0,
      }))

      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    // Handle object data for bar charts
    if (typeof metricData === "object" && !Array.isArray(metricData)) {
      const entries = Object.entries(metricData)

      // If it's a simple key-value object
      if (entries.every(([key, value]) => typeof value === "number")) {
        const chartData = entries.map(([key, value]) => ({
          name: key,
          value: value as number,
        }))

        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        )
      }
    }

    // Fallback: display as JSON
    return (
      <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-auto">
        <pre className="text-sm text-slate-700">{JSON.stringify(metricData, null, 2)}</pre>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
          <p className="text-slate-600">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-red-800 font-medium">Error al cargar métricas</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {Object.entries(data).map(([metricName, metricData]) => (
        <div key={metricName} className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 capitalize">{metricName.replace(/_/g, " ")}</h3>
          {renderChart(metricName, metricData)}
        </div>
      ))}
    </div>
  )
}

export default MetricsDisplay
