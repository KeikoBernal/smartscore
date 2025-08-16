"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { OrchestraDensityMap } from "@/components/visualizations/instrumental/orchestra-density-map"
import { ParticipationRoses } from "@/components/visualizations/instrumental/participation-roses"
import { FamilyDistribution } from "@/components/visualizations/instrumental/family-distribution"

const instrumentalMetrics = [
  {
    id: "densidad-instrumental",
    name: "Densidad instrumental",
    description: "Plano de orquesta interactivo",
    component: "orchestra-density",
  },
  {
    id: "frecuencia-aparicion",
    name: "Frecuencia de aparición",
    description: "Pentagrama de presencia",
    component: "frequency-heatmap",
  },
  {
    id: "duracion-promedio",
    name: "Duración promedio",
    description: "Rosas de participación",
    component: "participation-roses",
  },
  {
    id: "distribucion-familias",
    name: "Distribución por familias",
    description: "Escenario segmentado",
    component: "family-distribution",
  },
  {
    id: "solismo-tutti",
    name: "Solismo vs Tutti",
    description: "Partitura iluminada",
    component: "score-overlay",
  },
]

export default function InstrumentalAnalysisPage() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  const renderSelectedChart = () => {
    if (!selectedMetric) {
      return (
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          <p>Selecciona una métrica para ver su visualización</p>
        </div>
      )
    }

    switch (selectedMetric) {
      case "densidad-instrumental":
        return <OrchestraDensityMap data={null} />
      case "duracion-promedio":
        return <ParticipationRoses data={null} />
      case "distribucion-familias":
        return <FamilyDistribution data={null} />
      default:
        return (
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            <p>Gráfica en desarrollo...</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Regresar
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
                  SmartScore
                </h1>
                <p className="text-sm text-muted-foreground">Análisis Instrumental</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métricas Disponibles</CardTitle>
                <CardDescription>Selecciona una métrica para visualizar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {instrumentalMetrics.map((metric) => (
                  <Button
                    key={metric.id}
                    variant={selectedMetric === metric.id ? "default" : "ghost"}
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => setSelectedMetric(metric.id)}
                  >
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{metric.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedMetric ? instrumentalMetrics.find((m) => m.id === selectedMetric)?.name : "Visualización"}
                </CardTitle>
                <CardDescription>
                  {selectedMetric
                    ? instrumentalMetrics.find((m) => m.id === selectedMetric)?.description
                    : "Selecciona una métrica de la barra lateral"}
                </CardDescription>
              </CardHeader>
              <CardContent>{renderSelectedChart()}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
