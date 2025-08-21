import React, { useState } from "react";
import { analizarArchivo } from "../services/api";

const UploadPanel = ({ onResultados }) => {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!archivo) return;
    setCargando(true);
    try {
      const resultados = await analizarArchivo(archivo);
      onResultados(resultados); // Propaga resultados al componente padre
    } catch (error) {
      console.error("Error al analizar el archivo:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow-md bg-white">
      <h2 className="text-lg font-semibold mb-2">Subir archivo MIDI/XML</h2>
      <input
        type="file"
        accept=".mid,.midi,.xml"
        onChange={handleFileChange}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={!archivo || cargando}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {cargando ? "Analizando..." : "Analizar"}
      </button>
    </div>
  );
};

export default UploadPanel;