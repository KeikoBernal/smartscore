"use client"

import type React from "react"
import { useState } from "react"
import FileUpload from "./components/file-upload"
import Dashboard from "./components/Dashboard"
import "./styles/globals.css"

const App: React.FC = () => {
  const [hasFile, setHasFile] = useState(false)
  const [fileName, setFileName] = useState<string>("")

  const handleFileUploaded = (name: string) => {
    setFileName(name)
    setHasFile(true)
  }

  const handleBackToUpload = () => {
    setHasFile(false)
    setFileName("")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {!hasFile ? (
        <FileUpload onFileUploaded={handleFileUploaded} />
      ) : (
        <Dashboard fileName={fileName} onBackToUpload={handleBackToUpload} />
      )}
    </div>
  )
}

export default App
