"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Music, BarChart3, Waves, Palette, Layers, Puzzle, Network, Globe } from "lucide-react"

const analysisCategories = [
  {
    id: "instrumental",
    title: "Instrumental / Participación",
    description: "Mapeo de orquesta, patrones de participación y densidad instrumental",
    icon: Music,
    metrics: 5,
    color: "bg-mango-yellow",
    href: "/dashboard/instrumental",
  },
  {
    id: "melodic",
    title: "Melódicas",
    description: "Intervalos, motivos, ambitus y patrones de entropía melódica",
    icon: BarChart3,
    metrics: 5,
    color: "bg-mango-orange",
    href: "/dashboard/melodic",
  },
  {
    id: "rhythmic",
    title: "Rítmicas",
    description: "Patrones de duración, complejidad, polirritmia y regularidad métrica",
    icon: Waves,
    metrics: 5,
    color: "bg-mango-coral",
    href: "/dashboard/rhythmic",
  },
  {
    id: "harmonic",
    title: "Armónicas",
    description: "Progresiones de acordes, tensión, modulaciones y entropía armónica",
    icon: Palette,
    metrics: 5,
    color: "bg-mango-pink",
    href: "/dashboard/harmonic",
  },
  {
    id: "textural",
    title: "Texturales",
    description: "Distribución de voces, mapeo espacial y balance dinámico",
    icon: Layers,
    metrics: 4,
    color: "bg-mango-purple",
    href: "/dashboard/textural",
  },
  {
    id: "formal",
    title: "Formales",
    description: "Segmentación estructural, repetición y patrones de simetría",
    icon: Puzzle,
    metrics: 4,
    color: "bg-mango-yellow",
    href: "/dashboard/formal",
  },
  {
    id: "interaction",
    title: "Interacción / Complejidad",
    description: "Redes de interacción, simultaneidad temática y fractalidad",
    icon: Network,
    metrics: 5,
    color: "bg-mango-orange",
    href: "/dashboard/interaction",
  },
  {
    id: "global",
    title: "Métricas Globales",
    description: "Perfil compositivo, innovación, complejidad total y firma métrica",
    icon: Globe,
    metrics: 4,
    color: "bg-mango-coral",
    href: "/dashboard/global",
  },
]

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const goBackToUpload = () => {
    window.location.href = "/"
  }

  const selectCategory = (categoryId: string) => {
    window.location.href = `/dashboard/${categoryId}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-mango-yellow/10">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={goBackToUpload} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Carga de Archivos
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-mango-purple to-mango-coral bg-clip-text text-transparent">
                SmartScore
              </h1>
              <p className="text-muted-foreground">Selecciona una categoría de métricas para analizar</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métricas Disponibles</CardTitle>
                <CardDescription>Selecciona una categoría para explorar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysisCategories.map((category) => {
                  const IconComponent = category.icon
                  return (
                    <Card
                      key={category.id}
                      className="cursor-pointer transition-all hover:shadow-md hover:bg-mango-yellow/5"
                      onClick={() => selectCategory(category.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${category.color}/20`}>
                            <IconComponent className="h-4 w-4 text-mango-purple" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm leading-tight">{category.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {category.metrics} métricas
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {analysisCategories.slice(0, 4).map((category) => {
                  const IconComponent = category.icon
                  return (
                    <Card
                      key={category.id}
                      className="hover:shadow-lg transition-all cursor-pointer group hover:scale-105"
                      onClick={() => selectCategory(category.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-lg ${category.color}/20`}>
                            <IconComponent className="h-6 w-6 text-mango-purple" />
                          </div>
                          <Badge variant="secondary" className="bg-muted/50">
                            {category.metrics} métricas
                          </Badge>
                        </div>
                        <CardTitle className="text-lg group-hover:text-mango-coral transition-colors">
                          {category.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm leading-relaxed">{category.description}</CardDescription>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Additional Categories */}
              <div className="grid gap-4 md:grid-cols-4">
                {analysisCategories.slice(4).map((category) => {
                  const IconComponent = category.icon
                  return (
                    <Card
                      key={category.id}
                      className="hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => selectCategory(category.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className={`p-2 rounded-lg ${category.color}/20 w-fit`}>
                          <IconComponent className="h-4 w-4 text-mango-purple" />
                        </div>
                        <CardTitle className="text-sm group-hover:text-mango-coral transition-colors">
                          {category.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline" className="text-xs">
                          {category.metrics} métricas
                        </Badge>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Composiciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-mango-purple">1,247</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Métricas de Análisis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-mango-coral">42</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Visualizaciones Activas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-mango-orange">28</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Cola de Procesamiento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-mango-pink">15</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
