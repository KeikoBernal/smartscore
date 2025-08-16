"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DurationFigures } from "@/components/visualizations/rhythmic/duration-figures"
import { PulseWave } from "@/components/visualizations/rhythmic/pulse-wave"
import { PolyrhythmRibbons } from "@/components/visualizations/rhythmic/polyrhythm-ribbons"

const rhythmicMetrics = [
  {
    id: "duraciones-predominantes",
    name: "Duraciones predominantes",
    description: "Colgantes de figuras",
    component: "duration-figures",
  },
  {
    id: "complejidad-ritmica",
    name: "Complejidad rítmica",
    description: "Barra de pulso ondulante",
    component: "pulse-wave",
  },
  {
    id: "polirritmia",
    name: "Polirritmia",
    description: "Cintas entrelazadas",
    component: "polyrhythm-ribbons",
  },
  {
    id: "regularidad-metrica",
    name: "Regularidad métrica",
    description: "Metrónomo visual",
    component: "metronome-visual",
  },
  {
    id: "entropia-ritmica",
    name: "Entropía rítmica",
    description: "Pentagrama confeti",
    component: "rhythmic-confetti",
  },
]

export default function RhythmicAnalysisPage() {
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
      case "duraciones-predominantes":
        return <DurationFigures data={null} />
      case "complejidad-ritmica":
        return <PulseWave data={null} />
      case "polirritmia":
        return <PolyrhythmRibbons data={null} />
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
                <p className="text-sm text-muted-foreground">Análisis Rítmico</p>
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
                {rhythmicMetrics.map((metric) => (
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
                  {selectedMetric ? rhythmicMetrics.find((m) => m.id === selectedMetric)?.name : "Visualización"}
                </CardTitle>
                <CardDescription>
                  {selectedMetric
                    ? rhythmicMetrics.find((m) => m.id === selectedMetric)?.description
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
