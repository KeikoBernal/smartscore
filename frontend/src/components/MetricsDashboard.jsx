import React, { useState, useEffect } from "react";
import InstrumentSelector from "./InstrumentSelector";
import { analizarArchivo } from "../services/api";

const MetricsDashboard = ({ archivo }) => {
  const [instrumentos, setInstrumentos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [resultados, setResultados] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Análisis inicial al recibir archivo
  useEffect(() => {
    const analizar = async () => {
      if (!archivo) return;
      setCargando(true);
      try {
        const res = await analizarArchivo(archivo);
        setResultados(res);
        setInstrumentos(res.instrumentos_detectados || []);
      } catch (error) {
        console.error("Error al analizar:", error);
      } finally {
        setCargando(false);
      }
    };
    analizar();
  }, [archivo]);

  // Reanalizar con instrumentos seleccionados
  useEffect(() => {
    const reanalizarConFiltro = async () => {
      if (!archivo || seleccionados.length === 0) return;
      setCargando(true);
      try {
        const res = await analizarArchivo(archivo, seleccionados);
        setResultados(res);
      } catch (error) {
        console.error("Error al reanalizar:", error);
      } finally {
        setCargando(false);
      }
    };
    reanalizarConFiltro();
  }, [seleccionados]);

  return (
    <div className="mt-6">
      {cargando && <p className="text-blue-600">Procesando análisis...</p>}

      {instrumentos.length > 0 && (
        <InstrumentSelector
          instrumentos={instrumentos}
          seleccionados={seleccionados}
          setSeleccionados={setSeleccionados}
        />
      )}

      {resultados && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {Object.entries(resultados).map(([clave, valor]) => (
            <div key={clave} className="p-4 border rounded bg-gray-50 shadow-sm">
              <h3 className="font-semibold text-sm text-gray-700 mb-1">{clave}</h3>
              <p className="text-gray-900 text-lg">
                {typeof valor === "object" ? JSON.stringify(valor) : valor}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetricsDashboard;