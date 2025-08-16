"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Music, BarChart3, Waves, Palette, Layers, Puzzle, Network, Globe } from "lucide-react"

const categoryData = {
  instrumental: {
    name: "Instrumental / Participación",
    icon: Music,
    color: "bg-mango-yellow",
    metrics: [
      {
        id: "density",
        name: "Densidad instrumental",
        subtitle: "Plano de orquesta interactivo",
        description: "Mapeo de conteo normalizado por coordenadas de asientos con círculos coloreados",
      },
      {
        id: "frequency",
        name: "Frecuencia de aparición",
        subtitle: "Pentagrama de presencia",
        description: "Heatmap compás×instrumento mostrando patrones de participación",
      },
      {
        id: "duration",
        name: "Duración promedio",
        subtitle: "Rosas de participación",
        description: "Gráfico polar donde cada pétalo representa la duración media por familia",
      },
      {
        id: "distribution",
        name: "Distribución por familias",
        subtitle: "Escenario segmentado",
        description: "Gráfico de barras apiladas con tiempo sonoro normalizado por familia",
      },
      {
        id: "solism",
        name: "Solismo vs Tutti",
        subtitle: "Partitura iluminada",
        description: "Partitura base con superposiciones semitransparentes en secciones solo/tutti",
      },
    ],
  },
  melodic: {
    name: "Melódicas",
    icon: BarChart3,
    color: "bg-mango-orange",
    metrics: [
      {
        id: "intervals",
        name: "Intervalos predominantes",
        subtitle: "Escalera musical",
        description: "Gráfico de barras horizontal con grosor y color según frecuencia",
      },
      {
        id: "directionality",
        name: "Direccionalidad melódica",
        subtitle: "Pentagrama de flechas",
        description: "Flechas SVG sobre pentagrama con grosor/color según tendencia ascendente/descendente",
      },
      {
        id: "ambitus",
        name: "Ambitus",
        subtitle: "Termómetro de tesitura",
        description: "Medidor vertical coloreado según rango mínimo/máximo de pitch",
      },
      {
        id: "motifs",
        name: "Motivos recurrentes",
        subtitle: "Lupa sobre partitura",
        description: "Partitura con iconos de lupa marcando ocurrencias de motivos",
      },
      {
        id: "entropy",
        name: "Entropía melódica",
        subtitle: "Torbellino de notas",
        description: "Espirales de puntos sobre pentagrama con tamaño según entropía",
      },
    ],
  },
  rhythmic: {
    name: "Rítmicas",
    icon: Waves,
    color: "bg-mango-coral",
    metrics: [
      {
        id: "durations",
        name: "Duraciones predominantes",
        subtitle: "Colgantes de figuras",
        description: "Iconos SVG colgando con tamaño proporcional a frecuencia",
      },
      {
        id: "complexity",
        name: "Complejidad rítmica",
        subtitle: "Barra de pulso ondulante",
        description: "Gráfico de barras animado con altura según varianza por compás",
      },
      {
        id: "polyrhythm",
        name: "Polirritmia",
        subtitle: "Cintas entrelazadas",
        description: "Cintas horizontales transparentes que se cruzan según densidad de onsets",
      },
      {
        id: "regularity",
        name: "Regularidad métrica",
        subtitle: "Metrónomo visual",
        description: "Animación tipo péndulo cuyo ritmo refleja el índice de jitter",
      },
      {
        id: "entropy",
        name: "Entropía rítmica",
        subtitle: "Pentagrama confeti",
        description: "Iconos de figuras rítmicas dispersos sobre pentagrama según entropía",
      },
    ],
  },
  harmonic: {
    name: "Armónicas",
    icon: Palette,
    color: "bg-mango-pink",
    metrics: [
      {
        id: "progressions",
        name: "Progresiones",
        subtitle: "Camino de acordes",
        description: "Líneas sobre círculo de quintas uniendo puntos de acordes",
      },
      {
        id: "tension",
        name: "Tensión armónica",
        subtitle: "Gráfico de olas",
        description: "Área suave sobre partitura con picos según tensión armónica",
      },
      {
        id: "modulations",
        name: "Modulaciones",
        subtitle: "Mapa de tonos",
        description: "Bloques semitransparentes sobre pentagrama coloreados por tonalidad",
      },
      {
        id: "chords",
        name: "Distribución de acordes",
        subtitle: "Jardín de acordes",
        description: "Flores SVG en espacio 2D, forma según tipo y tamaño por frecuencia",
      },
      {
        id: "entropy",
        name: "Entropía armónica",
        subtitle: "Arco iris sobre score",
        description: "Franjas de colores difusos sobre partitura según entropía calculada",
      },
    ],
  },
  textural: {
    name: "Texturales",
    icon: Layers,
    color: "bg-mango-purple",
    metrics: [
      {
        id: "texture-type",
        name: "Tipo de textura",
        subtitle: "Tejido musical",
        description: "Red de líneas entre secciones según homofonía vs contrapunto",
      },
      {
        id: "voices",
        name: "Voces simultáneas",
        subtitle: "Torre de pentagramas",
        description: "Barras apiladas estilo pastel, altura = número de voces",
      },
      {
        id: "spatial",
        name: "Distribución espacial",
        subtitle: "Mapa de registro",
        description: "Líneas coloreadas desde asientos hacia arriba/abajo según altura MIDI",
      },
      {
        id: "balance",
        name: "Balance dinámico",
        subtitle: "Vu-metro orquestal",
        description: "VUMeter animado mostrando valores dinámicos por asiento",
      },
    ],
  },
  formal: {
    name: "Formales",
    icon: Puzzle,
    color: "bg-mango-yellow",
    metrics: [
      {
        id: "segmentation",
        name: "Segmentación",
        subtitle: "Rompecabezas musical",
        description: "Piezas encajadas a lo largo de una línea de tiempo",
      },
      {
        id: "sections",
        name: "Duración de secciones",
        subtitle: "Pastel de movimientos",
        description: "Gráfico circular animado que crece/retrae según porcentaje de duración",
      },
      {
        id: "repetition",
        name: "Repetición temática",
        subtitle: "Caminos marcados",
        description: "Líneas de color conectando ocurrencias de motivos sobre pentagrama",
      },
      {
        id: "symmetry",
        name: "Simetría formal",
        subtitle: "Espejo sonoro",
        description: "Bloques espejo con gradientes reflejando correlación de segmentos",
      },
    ],
  },
  interaction: {
    name: "Interacción / Complejidad",
    icon: Network,
    color: "bg-mango-orange",
    metrics: [
      {
        id: "network",
        name: "Red de interacción",
        subtitle: "Mapa de conexiones",
        description: "Grafo con nodos = asientos y flechas de grosor según co-ocurrencia",
      },
      {
        id: "simultaneity",
        name: "Simultaneidad temática",
        subtitle: "Panel de luces",
        description: "Grilla donde fila=motivo y celda iluminada según coincidencia en compás",
      },
      {
        id: "counterpoint",
        name: "Contrapunto activo",
        subtitle: "Cinta infinita",
        description: "Canvas scrollable con bandas entrelazadas según índice de contrapunto",
      },
      {
        id: "entropy",
        name: "Entropía de interacción",
        subtitle: "Mosaico animado",
        description: "Mosaico animado con color y variaciones según diversidad de combinaciones",
      },
      {
        id: "fractality",
        name: "Fractalidad",
        subtitle: "Árbol genealógico",
        description: "Dendrograma mostrando estructura de auto-similitud",
      },
    ],
  },
  global: {
    name: "Métricas Globales",
    icon: Globe,
    color: "bg-mango-coral",
    metrics: [
      {
        id: "profile",
        name: "Perfil compositivo",
        subtitle: "Retrato musical",
        description: "Gráfico radar dentro de un marco SVG decorativo",
      },
      {
        id: "innovation",
        name: "Índice de innovación",
        subtitle: "Termómetro o tornado",
        description: "Medidor animado mostrando Z-score relativo",
      },
      {
        id: "complexity",
        name: "Complejidad total",
        subtitle: "Medidor de energía",
        description: "Potenciómetro giratorio con iconos musicales",
      },
      {
        id: "signature",
        name: "Firma métrica",
        subtitle: "Huella digital sonora",
        description: "Código de barras con símbolos musicales como franjas",
      },
    ],
  },
}

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.category as string
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  const category = categoryData[categoryId as keyof typeof categoryData]

  if (!category) {
    return <div>Categoría no encontrada</div>
  }

  const goBack = () => {
    window.location.href = "/dashboard"
  }

  const selectMetric = (metricId: string) => {
    setSelectedMetric(metricId)
    // Here you would typically load the specific visualization
    console.log(`[v0] Selected metric: ${metricId} in category: ${categoryId}`)
  }

  const IconComponent = category.icon

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
                <p className="text-muted-foreground">Selecciona una métrica para visualizar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Metrics Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métricas Disponibles</CardTitle>
                <CardDescription>{category.metrics.length} métricas en esta categoría</CardDescription>
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
                          <h4 className="font-semibold text-sm leading-tight">{metric.name}</h4>
                          <p className="text-xs text-mango-coral font-medium mt-1">{metric.subtitle}</p>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{metric.description}</p>
                        </div>
                        {selectedMetric === metric.id && (
                          <Badge variant="default" className="bg-mango-coral text-white">
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

          {/* Visualization Area */}
          <div className="lg:col-span-2">
            <Card className="h-full min-h-[600px]">
              <CardHeader>
                <CardTitle>
                  {selectedMetric
                    ? category.metrics.find((m) => m.id === selectedMetric)?.name
                    : "Espacio para mostrar la gráfica seleccionada"}
                </CardTitle>
                {selectedMetric && (
                  <CardDescription>{category.metrics.find((m) => m.id === selectedMetric)?.subtitle}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                {selectedMetric ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-mango-coral to-mango-purple rounded-full mx-auto flex items-center justify-center">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {category.metrics.find((m) => m.id === selectedMetric)?.name}
                      </h3>
                      <p className="text-mango-coral font-medium">
                        {category.metrics.find((m) => m.id === selectedMetric)?.subtitle}
                      </p>
                      <p className="text-muted-foreground mt-2 max-w-md">
                        {category.metrics.find((m) => m.id === selectedMetric)?.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="mt-4">
                      Visualización en desarrollo
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <div className="w-24 h-24 bg-mango-yellow/20 rounded-full mx-auto flex items-center justify-center mb-4">
                      <BarChart3 className="h-12 w-12 text-mango-orange" />
                    </div>
                    <p>Selecciona una métrica de la barra lateral para ver su visualización</p>
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
