import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, AudioWaveformIcon as Waveform, Target, Palette, Network, TrendingUp } from "lucide-react"

const analysisCategories = [
  {
    title: "Instrumental Analysis",
    description: "Orchestra mapping, participation patterns, and instrumental density",
    icon: Music,
    metrics: 5,
    color: "bg-mango-purple",
    href: "/dashboard/instrumental",
  },
  {
    title: "Melodic Analysis",
    description: "Intervals, motifs, ambitus, and melodic entropy patterns",
    icon: Waveform,
    metrics: 5,
    color: "bg-mango-coral",
    href: "/dashboard/melodic",
  },
  {
    title: "Rhythmic Analysis",
    description: "Duration patterns, complexity, polyrhythm, and metric regularity",
    icon: Target,
    metrics: 5,
    color: "bg-mango-pink",
    href: "/dashboard/rhythmic",
  },
  {
    title: "Harmonic Analysis",
    description: "Chord progressions, tension, modulations, and harmonic entropy",
    icon: Palette,
    metrics: 5,
    color: "bg-mango-orange",
    href: "/dashboard/harmonic",
  },
  {
    title: "Textural Analysis",
    description: "Voice distribution, spatial mapping, and dynamic balance",
    icon: Network,
    metrics: 4,
    color: "bg-mango-yellow",
    href: "/dashboard/textural",
  },
  {
    title: "Formal Analysis",
    description: "Structure segmentation, repetition, and symmetry patterns",
    icon: TrendingUp,
    metrics: 4,
    color: "bg-mango-purple",
    href: "/dashboard/formal",
  },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Music Analysis Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analysis and visualization of musical compositions</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {analysisCategories.map((category) => (
            <Card key={category.href} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${category.color}/20`}>
                    <category.icon
                      className={`h-5 w-5 text-white`}
                      style={{ color: `var(--color-${category.color.replace("bg-", "")})` }}
                    />
                  </div>
                  <Badge variant="secondary" className="bg-muted/50">
                    {category.metrics} metrics
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">{category.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Compositions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-mango-purple">1,247</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Analysis Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-mango-coral">42</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Visualizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-mango-orange">28</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Processing Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-mango-pink">15</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
