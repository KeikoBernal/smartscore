"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileMusic, FileText, Loader2 } from "lucide-react"
import { useFileUpload } from "@/hooks/use-music-data"
import { useArchivos } from "@/context/ArchivoContext"

export default function WelcomePage() {
  console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
  const [files, setFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { uploadFiles } = useFileUpload()
  const { setArchivos } = useArchivos()

  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return

    const validFiles = Array.from(uploadedFiles).filter((file) => {
      const extension = file.name.toLowerCase().split(".").pop()
      return extension === "mid" || extension === "midi" || extension === "xml"
    })

    setFiles((prev) => [...prev, ...validFiles])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const proceedToAnalysis = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const result = await uploadFiles(files)

      // Guardar en contexto global
      setArchivos(result.files.map((f: { file: File; id: string }) => ({
        file: f.file,
        id: f.id
      })))

      window.location.href = "/dashboard"
    } catch (error) {
      console.error("[SmartScore] Error al subir archivos:", error)
      setUploadError(error instanceof Error ? error.message : "Error al subir archivos")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mango-yellow/20 via-mango-orange/20 to-mango-coral/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-mango-purple to-mango-coral bg-clip-text text-transparent">
            SmartScore
          </CardTitle>
          <CardDescription className="text-xl mt-4">
            Bienvenido al sistema de análisis musical avanzado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Área de carga */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-mango-coral bg-mango-coral/10"
                : "border-mango-orange hover:border-mango-coral hover:bg-mango-coral/5"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-mango-orange mb-4" />
            <h3 className="text-lg font-semibold mb-2">Cargar Archivo</h3>
            <p className="text-muted-foreground mb-4">
              Arrastra y suelta tus archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Formatos permitidos: MIDI (.mid, .midi) y XML (.xml)
            </p>

            <input
              type="file"
              multiple
              accept=".mid,.midi,.xml"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer bg-transparent">
                Seleccionar Archivos
              </Button>
            </label>
          </div>

          {/* Lista de archivos */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Archivos cargados:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-mango-yellow/10 rounded">
                  {file.name.toLowerCase().includes(".xml") ? (
                    <FileText className="h-4 w-4 text-mango-orange" />
                  ) : (
                    <FileMusic className="h-4 w-4 text-mango-coral" />
                  )}
                  <span className="text-sm">{file.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {uploadError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{uploadError}</p>
            </div>
          )}

          {/* Botón de continuar */}
          <Button
            onClick={proceedToAnalysis}
            disabled={files.length === 0 || isUploading}
            className="w-full bg-gradient-to-r from-mango-coral to-mango-purple hover:from-mango-coral/90 hover:to-mango-purple/90"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo archivos...
              </>
            ) : (
              "Continuar al Análisis"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}