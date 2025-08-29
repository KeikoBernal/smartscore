"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import MetricsDisplay from "./MetricsDisplay"
import { obtenerInstrumentos } from "../services/api"

interface DashboardProps {
  fileName: string
  onBackToUpload: () => void
}

const Dashboard: React.FC<DashboardProps> = ({ fileName, onBackToUpload }) => {
  const [selectedCategory, setSelectedCategory] = useState("melodicas")
  const [selectedMode, setSelectedMode] = useState<"global" | "compases" | "mixtas" | "todos">("global")
  const [selectedInstrument, setSelectedInstrument] = useState("")
  const [instruments, setInstruments] = useState<string[]>([])

  useEffect(() => {
    const loadInstruments = async () => {
      try {
        const response = await obtenerInstrumentos(fileName)
        setInstruments(response.data)
      } catch (error) {
        console.error("Error loading instruments:", error)
      }
    }

    loadInstruments()
  }, [fileName])

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        fileName={fileName}
        onBackToUpload={onBackToUpload}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Análisis de {fileName}</h1>
              <p className="text-slate-600 mt-1">
                Categoría: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Mode Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-700">Modo:</label>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value as typeof selectedMode)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="global">Global</option>
                  <option value="compases">Compases</option>
                  <option value="mixtas">Mixtas</option>
                  <option value="todos">Todos</option>
                </select>
              </div>

              {/* Instrument Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-700">Instrumento:</label>
                <select
                  value={selectedInstrument}
                  onChange={(e) => setSelectedInstrument(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Todos los instrumentos</option>
                  {instruments.map((instrument, index) => (
                    <option key={index} value={instrument}>
                      {instrument}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <MetricsDisplay
            fileName={fileName}
            category={selectedCategory}
            mode={selectedMode}
            instrument={selectedInstrument}
          />
        </main>
      </div>
    </div>
  )
}

export default Dashboard
