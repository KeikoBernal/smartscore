import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ✅ Serializador compatible con FastAPI
const serializeParams = (params: Record<string, any>) => {
  const query = new URLSearchParams();
  if (Array.isArray(params.archivos)) {
    params.archivos.forEach((a: string) => query.append('archivos', a));
  }
  if (Array.isArray(params.instrumentos)) {
    params.instrumentos.forEach((i: string) => query.append('instrumentos', i));
  }
  return query.toString();
};

// ✅ Subir archivo MIDI
export const subirArchivo = (formData: FormData) =>
  api.post('/upload/', formData);

// ✅ Obtener métricas globales
export const obtenerMetricasGlobales = (archivo: string, instrumentos: string[] = []) =>
  api.get('/metrics/', {
    params: {
      archivos: [archivo],
      instrumentos,
    },
    paramsSerializer: serializeParams,
  });

// ✅ Obtener métricas por compases
export const obtenerCompases = (archivo: string, instrumentos: string[] = []) =>
  api.get('/compases/', {
    params: {
      archivos: [archivo],
      instrumentos,
    },
    paramsSerializer: serializeParams,
  });

// ✅ Obtener métricas mixtas
export const obtenerMixtas = (archivo: string, instrumentos: string[] = []) =>
  api.get('/mixtas/', {
    params: {
      archivos: [archivo],
      instrumentos,
    },
    paramsSerializer: serializeParams,
  });

// ✅ Obtener lista de instrumentos detectados
export const obtenerInstrumentos = (archivo: string) =>
  api.get('/instrumentos/', {
    params: { archivo },
  });

// ✅ Obtener métricas por categoría
export const obtenerMetricasPorCategoria = (
  archivo: string,
  categoria: string,
  instrumento: string = '',
  modo: 'global' | 'compases' | 'mixtas' | 'todos' = 'global'
) =>
  api.get('/metricas/', {
    params: {
      archivo,
      categoria,
      instrumento: instrumento || undefined,
      modo,
    },
  });