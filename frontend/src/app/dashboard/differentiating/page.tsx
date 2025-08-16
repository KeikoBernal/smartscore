"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

const DIFFERENTIATING_METRICS = [
  {
    id: "entropy-rainbow",
    name: "Mapa de arco iris",
    description: "Entropía melódica/armónica/rítmica con gradiente rainbow",
    type: "Multi-BarChart",
  },
  {
    id: "musical-mirror",
    name: "Espejo musical",
    description: "Simetría formal con bloques espejados conectados",
    type: "Mirrored SVG",
  },
  {
    id: "golden-rule",
    name: "Regla de oro",
    description: "Sección áurea marcando offsets φ×duración",
    type: "TimelineChart",
  },
  {
    id: "tonal-variety",
    name: "Mapa tonal comparativo",
    description: "Variedad tonal coloreada por proporción de cada tono",
    type: "MosaicChart",
  },
  {
    id: "digital-pulse",
    name: "Pulso digital",
    description: "Complejidad rítmica comparando síncopas vs patrones únicos",
    type: "Multi-BarChart",
  },
  {
    id: "neural-network",
    name: "Red neuronal orquestal",
    description: "Red de interacción con densidad de enlaces",
    type: "Force Graph",
  },
  {
    id: "zscore-gauges",
    name: "Z-score gauges",
    description: "Innovación estadística con percentiles de métricas clave",
    type: "GaugeChart",
  },
  {
    id: "fractal-signature",
    name: "Árbol ramificado",
    description: "Firma fractal con nodos coloridos según niveles fractales",
    type: "Animated TreeChart",
  },
]

export default function DifferentiatingMetricsPage() {
  const [selectedMetric, setSelectedMetric] = useState<string>(DIFFERENTIATING_METRICS[0].id)
  const router = useRouter()

  const currentMetric = DIFFERENTIATING_METRICS.find((m) => m.id === selectedMetric)

  // Generar datos aleatorios para la demostración
  const generateRandomData = () => {
    switch (selectedMetric) {
      case "entropy-rainbow":
        return Array.from({ length: 12 }, (_, i) => ({
          name: `Medida ${i + 1}`,
          melodic: Math.random() * 100,
          harmonic: Math.random() * 100,
          rhythmic: Math.random() * 100,
        }))
      case "tonal-variety":
        return Array.from({ length: 12 }, (_, i) => ({
          tone: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][i],
          proportion: Math.random() * 100,
        }))
      default:
        return Array.from({ length: 10 }, (_, i) => ({
          x: i,
          y: Math.random() * 100,
        }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Regresar
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-purple-600 bg-clip-text text-transparent">
              SmartScore
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar con métricas */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">Métricas Diferenciadoras</CardTitle>
                <CardDescription>Selecciona una métrica para visualizar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {DIFFERENTIATING_METRICS.map((metric) => (
                  <Button
                    key={metric.id}
                    variant={selectedMetric === metric.id ? "default" : "ghost"}
                    className={`w-full justify-start text-left h-auto p-3 ${
                      selectedMetric === metric.id
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                        : "hover:bg-orange-50"
                    }`}
                    onClick={() => setSelectedMetric(metric.id)}
                  >
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-xs opacity-80 mt-1">{metric.type}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Área principal de visualización */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">{currentMetric?.name}</CardTitle>
                <CardDescription>{currentMetric?.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-100 to-purple-100 rounded-lg">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-yellow-500 to-purple-600 rounded-full flex items-center justify-center">
                      <div className="text-white font-bold text-xl">📊</div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{currentMetric?.name}</h3>
                      <p className="text-gray-600 mb-4">Visualización de {currentMetric?.type}</p>
                      <div className="text-sm text-gray-500">
                        Datos generados: {JSON.stringify(generateRandomData().slice(0, 3), null, 2)}...
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
