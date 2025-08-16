"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Music,
  AudioWaveformIcon as Waveform,
  Palette,
  Network,
  Target,
  TrendingUp,
  Calendar,
  Filter,
  Globe,
} from "lucide-react"

const navigationItems = [
  {
    title: "Overview",
    icon: BarChart3,
    href: "/dashboard",
    badge: null,
  },
  {
    title: "Instrumental",
    icon: Music,
    href: "/dashboard/instrumental",
    badge: "5",
  },
  {
    title: "Melodic",
    icon: Waveform,
    href: "/dashboard/melodic",
    badge: "5",
  },
  {
    title: "Rhythmic",
    icon: Target,
    href: "/dashboard/rhythmic",
    badge: "5",
  },
  {
    title: "Harmonic",
    icon: Palette,
    href: "/dashboard/harmonic",
    badge: "5",
  },
  {
    title: "Textural",
    icon: Network,
    href: "/dashboard/textural",
    badge: "4",
  },
  {
    title: "Formal",
    icon: TrendingUp,
    href: "/dashboard/formal",
    badge: "4",
  },
  {
    title: "Interaction",
    icon: Network,
    href: "/dashboard/interaction",
    badge: "5",
  },
  {
    title: "Global Metrics",
    icon: Globe,
    href: "/dashboard/global",
    badge: "6",
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Filters</h2>
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Filter className="mr-2 h-4 w-4" />
              Metrics
            </Button>
          </div>
        </div>

        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Analysis</h2>
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start hover:bg-mango-purple/10 hover:text-mango-purple"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-mango-coral/20 text-mango-coral border-mango-coral/30"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
