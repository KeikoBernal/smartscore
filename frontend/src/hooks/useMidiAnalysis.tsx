import { useState } from 'react';
import {
  subirArchivo,
  obtenerInstrumentos,
  obtenerMetricasPorCategoria,
} from '../services/api';

export function useMidiAnalysis() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [instrumentosDetectados, setInstrumentosDetectados] = useState<string[]>([]);
  const [instrumentoSeleccionado, setInstrumentoSeleccionado] = useState<string>('');
  const [instrumentoPendiente, setInstrumentoPendiente] = useState<string>('');
  const [modo, setModo] = useState<'global' | 'compases' | 'mixtas' | 'todos'>('global');
  const [categoria, setCategoria] = useState<string>('melodicas');
  const [resultado, setResultado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  const analizar = async (instrumento?: string) => {
    if (!archivo || !categoria) return;
    setCargando(true);

    // Usa el instrumento explícitamente si se pasó, incluso si es ''
    const instrumentoFinal = instrumento !== undefined ? instrumento : instrumentoSeleccionado;

    try {
      const res = await obtenerMetricasPorCategoria(
        archivo.name,
        categoria,
        instrumentoFinal,
        modo
      );

      setResultado(res.data);
      setInstrumentoSeleccionado(instrumentoFinal);
      setInstrumentoPendiente('');
    } catch (err: any) {
      setResultado({
        error: err.response?.data?.error || 'Error desconocido',
      });
    } finally {
      setCargando(false);
    }
  };

  const subirYPreparar = async (file: File) => {
    setArchivo(file);
    setCargando(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      await subirArchivo(formData);

      const instrumentos = await obtenerInstrumentos(file.name);
      setInstrumentosDetectados(instrumentos.data);

      await analizar(); // análisis inicial sin filtro
    } catch (err: any) {
      setResultado({
        error: err.response?.data?.error || 'Error desconocido',
      });
    } finally {
      setCargando(false);
    }
  };

  return {
    archivo,
    setArchivo,
    instrumentosDetectados,
    instrumentoSeleccionado,
    instrumentoPendiente,
    setInstrumentoPendiente,
    setInstrumentoSeleccionado,
    modo,
    setModo,
    categoria,
    setCategoria,
    resultado,
    cargando,
    analizar,
    subirYPreparar,
  };
}