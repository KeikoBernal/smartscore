import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { SWRProvider } from "@/hooks/use-swr-config"
import "./globals.css"

export const metadata: Metadata = {
  title: "SmartScore - Music Analysis Dashboard",
  description: "Advanced music analysis and visualization platform",
  generator: "SmartScore Frontend",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="antialiased">
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  )
}
