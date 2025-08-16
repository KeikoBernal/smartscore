"use client"

import { createContext, useContext, useState } from "react"

type Archivo = {
  file: File
  id: string // ← ahora es obligatorio
}

type ArchivoContextType = {
  archivos: Archivo[]
  setArchivos: (files: Archivo[]) => void
}

const ArchivoContext = createContext<ArchivoContextType | undefined>(undefined)

export function ArchivoProvider({ children }: { children: React.ReactNode }) {
  const [archivos, setArchivos] = useState<Archivo[]>([])

  return (
    <ArchivoContext.Provider value={{ archivos, setArchivos }}>
      {children}
    </ArchivoContext.Provider>
  )
}

export const useArchivos = () => {
  const context = useContext(ArchivoContext)
  if (!context) {
    throw new Error("useArchivos debe usarse dentro de <ArchivoProvider>")
  }
  return context
}