"use client"

import type React from "react"
import { useState } from "react"
import { subirArchivo, obtenerInstrumentos } from "../services/api"

interface FileUploadProps {
  onFileUploaded: (fileName: string) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>("")

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".mid") && !file.name.endsWith(".midi")) {
      setError("Por favor selecciona un archivo MIDI válido (.mid o .midi)")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      await subirArchivo(formData)
      await obtenerInstrumentos(file.name) // Preparar instrumentos

      onFileUploaded(file.name)
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al subir el archivo")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">SmartScore Analyzer</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Análisis matemático avanzado de música clásica mediante inteligencia artificial
          </p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            isDragging ? "border-indigo-400 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        >
          <input
            type="file"
            accept=".mid,.midi"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto text-slate-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            {isUploading ? (
              <div className="space-y-2">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-slate-600">Procesando archivo MIDI...</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-slate-900">Arrastra tu archivo MIDI aquí</h3>
                <p className="text-slate-500">o haz clic para seleccionar un archivo</p>
                <p className="text-sm text-slate-400">Formatos soportados: .mid, .midi</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload
