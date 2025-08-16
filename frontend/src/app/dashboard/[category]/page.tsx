"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Music,
  BarChart3,
  Waves,
  Palette,
  Layers,
  Puzzle,
  Network,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useFileMetrics } from "@/hooks/use-music-data"
import { useArchivos } from "@/context/ArchivoContext"

// 🧩 Tipos explícitos
type Metric = {
  id: string
  name: string
  subtitle: string
  description: string
}

type Category = {
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  metrics: Metric[]
}

const categoryData: Record<string, Category> = {
  instrumental: {
    name: "Instrumental / Participación",
    icon: Music,
    color: "bg-mango-yellow",
    metrics: [],
  },
  melodic: {
    name: "Melódicas",
    icon: BarChart3,
    color: "bg-mango-orange",
    metrics: [],
  },
  rhythmic: {
    name: "Rítmicas",
    icon: Waves,
    color: "bg-mango-coral",
    metrics: [],
  },
  harmonic: {
    name: "Armónicas",
    icon: Palette,
    color: "bg-mango-pink",
    metrics: [],
  },
  textural: {
    name: "Texturales",
    icon: Layers,
    color: "bg-mango-purple",
    metrics: [],
  },
  formal: {
    name: "Formales",
    icon: Puzzle,
    color: "bg-mango-yellow",
    metrics: [],
  },
  interaction: {
    name: "Interacción / Complejidad",
    icon: Network,
    color: "bg-mango-orange",
    metrics: [],
  },
  global: {
    name: "Métricas Globales",
    icon: Globe,
    color: "bg-mango-coral",
    metrics: [],
  },
}

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.category as keyof typeof categoryData
  const category = categoryData[categoryId]

  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [fileId, setFileId] = useState<string | null>(null)

  const { archivos } = useArchivos()

  useEffect(() => {
    if (archivos.length > 0) {
      setFileId(archivos[0].id)
    }
  }, [archivos])

  const { data, error, isLoading } = useFileMetrics(fileId || "", categoryId)

  if (!category) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Categoría no encontrada
      </div>
    )
  }

  const goBack = () => {
    window.location.href = "/dashboard"
  }

  const selectMetric = (metricId: string) => {
    setSelectedMetric(metricId)
    console.log(
      `[SmartScore] Métrica seleccionada: ${metricId} en categoría: ${categoryId}`
    )
  }

  const IconComponent = category.icon
  const selected: Metric | undefined = category.metrics.find(
    (m) => m.id === selectedMetric
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-mango-yellow/10">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={goBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Categorías
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-2 rounded-lg ${category.color}/20`}>
                <IconComponent className="h-6 w-6 text-mango-purple" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-mango-purple to-mango-coral bg-clip-text text-transparent">
                  {category.name}
                </h1>
                <p className="text-muted-foreground">
                  Selecciona una métrica para visualizar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métricas Disponibles</CardTitle>
                <CardDescription>
                  {category.metrics.length} métricas en esta categoría
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {category.metrics.map((metric) => (
                  <Card
                    key={metric.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedMetric === metric.id
                        ? "ring-2 ring-mango-coral bg-mango-coral/5"
                        : "hover:bg-mango-yellow/5"
                    }`}
                    onClick={() => selectMetric(metric.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm leading-tight">
                            {metric.name}
                          </h4>
                          <p className="text-xs text-mango-coral font-medium mt-1">
                            {metric.subtitle}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {metric.description}
                          </p>
                        </div>
                        {selectedMetric === metric.id && (
                          <Badge
                            variant="default"
                            className="bg-mango-coral text-white"
                          >
                            Activa
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-2">
            <Card className="h-full min-h-[600px]">
              <CardHeader>
                <CardTitle>
                  {selected
                    ? selected.name
                    : "Espacio para mostrar la gráfica seleccionada"}
                </CardTitle>
                {selected && (
                  <CardDescription>{selected.subtitle}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                {isLoading ? (
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-mango-coral" />
                    <p className="text-muted-foreground">Cargando datos...</p>
                  </div>
                ) : error ? (
                  <div className="text-center space-y-4">
                    <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
                    <p className="text-red-600">Error al cargar los datos</p>
                    <p className="text-sm text-muted-foreground">
                      {error.message}
                    </p>
                  </div>
                ) : selectedMetric && data ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-mango-coral to-mango-purple rounded-full mx-auto flex items-center justify-center">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    {selected && (
                      <>
                        <h3 className="text-lg font-semibold">
                          {selected.name}
                        </h3>
                        <p className="text-mango-coral font-medium">
                          {selected.subtitle}
                        </p>
                        <p className="text-muted-foreground mt-2 max-w-md">
                          {selected.description}
                        </p>
                      </>
                    )}
                    <div className="mt-4 p-4 bg-mango-yellow/10 rounded-lg">
                      <p className="text-sm font-medium mb-2">
                        Datos recibidos:
                      </p>
                      <pre className="text-xs text-left overflow-auto max-h-32">
                        {JSON.stringify(data[selectedMetric] || data, null, 2)}
                      </pre>
                    </div>
                    <Badge variant="outline" className="mt-4">
                      Datos cargados - Visualización en desarrollo
                    </Badge>
                                      </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <div className="w-24 h-24 bg-mango-yellow/20 rounded-full mx-auto flex items-center justify-center mb-4">
                      <BarChart3 className="h-12 w-12 text-mango-orange" />
                    </div>
                    <p>
                      Selecciona una métrica de la barra lateral para ver su visualización
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
