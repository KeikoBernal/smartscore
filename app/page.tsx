"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  const handleFileUploaded = (filename: string) => {
    setUploadedFile(filename)
  }

  const handleBackToUpload = () => {
    setUploadedFile(null)
  }

  return (
    <main className="min-h-screen bg-background">
      {!uploadedFile ? (
        <FileUpload onFileUploaded={handleFileUploaded} />
      ) : (
        <Dashboard filename={uploadedFile} onBackToUpload={handleBackToUpload} />
      )}
    </main>
  )
}
