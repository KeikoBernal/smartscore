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
  const [modo, setModo] = useState<'global' | 'compases' | 'mixtas' | 'todos'>('todos');
  // Cambiar el tipo de 'categoria' para incluir 'todos'
  const [categoria, setCategoria] = useState<
    | 'todas'
    | 'instrumentales'
    | 'melodicas'
    | 'ritmicas'
    | 'armonicas'
    | 'texturales'
    | 'formales'
    | 'interaccion'
    | 'comparativas'
    | 'diferenciadoras'
    | 'todos' // Añadir 'todos' aquí
  >('todas'); // Mantener 'todas' como valor inicial para el frontend

  const [resultado, setResultado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  const analizar = async (instrumento?: string) => {
    if (!archivo || !categoria) return;
    setCargando(true);

    // Usa el instrumento explícitamente si se pasó, incluso si es ''
    const instrumentoFinal = instrumento !== undefined ? instrumento : instrumentoSeleccionado;

    try {
      // Si la categoría seleccionada en el frontend es 'todas',
      // la enviamos como 'todos' al backend para obtener todas las métricas.
      const categoriaBackend = categoria === 'todas' ? 'todos' : categoria;

      const res = await obtenerMetricasPorCategoria(
        archivo.name,
        categoriaBackend, // Usar categoriaBackend aquí
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

      // Al subir y preparar, realizar un análisis inicial con la categoría 'todas' (que se mapea a 'todos' en el backend)
      // y el modo 'todos' para obtener un conjunto completo de métricas por defecto.
      await analizar();
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