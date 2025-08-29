"use client"

import type React from "react"

interface SidebarProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  fileName: string
  onBackToUpload: () => void
}

const CATEGORIES = [
  { id: "instrumentales", name: "Instrumentales", icon: "🎼" },
  { id: "melodicas", name: "Melódicas", icon: "🎵" },
  { id: "ritmicas", name: "Rítmicas", icon: "🥁" },
  { id: "armonicas", name: "Armónicas", icon: "🎹" },
  { id: "texturales", name: "Texturales", icon: "🎨" },
  { id: "formales", name: "Formales", icon: "📐" },
  { id: "interaccion", name: "Interacción", icon: "🔗" },
  { id: "comparativas", name: "Comparativas", icon: "📊" },
  { id: "diferenciadoras", name: "Diferenciadoras", icon: "🔍" },
]

const Sidebar: React.FC<SidebarProps> = ({ selectedCategory, onCategoryChange, fileName, onBackToUpload }) => {
  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">SmartScore</h2>
            <p className="text-sm text-slate-500">Analyzer</p>
          </div>
        </div>

        <button
          onClick={onBackToUpload}
          className="w-full px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Subir nuevo archivo</span>
        </button>
      </div>

      {/* File Info */}
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-sm font-medium text-slate-700 mb-2">Archivo actual</h3>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-sm font-medium text-slate-900 truncate" title={fileName}>
            {fileName}
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 p-6">
        <h3 className="text-sm font-medium text-slate-700 mb-4">Categorías de métricas</h3>
        <nav className="space-y-1">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                selectedCategory === category.id
                  ? "bg-indigo-100 text-indigo-700 font-medium"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="text-sm">{category.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
