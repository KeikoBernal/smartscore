import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { SWRProvider } from "@/hooks/use-swr-config"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "SmartScore - Panel de Análisis Musical",
  description: "Plataforma avanzada de análisis y visualización musical",
  generator: "SmartScore Frontend",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={geistSans.variable}>
      <body className="font-sans antialiased">
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  )
}
