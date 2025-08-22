import { useState } from 'react';
import {
  subirArchivo,
  obtenerMetricasGlobales,
  obtenerCompases,
  obtenerMixtas,
} from '../services/api';

type Resultado = {
  mensaje?: string;
  nombre?: string;
  error?: string;
  [clave: string]: any;
};

export default function MidiAnalyzer() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [modo, setModo] = useState<'global' | 'compases' | 'mixtas'>('global');

  const handleUpload = async () => {
    if (!archivo) return;

    const formData = new FormData();
    formData.append('file', archivo); // ✅ Campo corregido

    try {
      await subirArchivo(formData);

      let res;
      if (modo === 'global') {
        res = await obtenerMetricasGlobales(archivo.name);
      } else if (modo === 'compases') {
        res = await obtenerCompases(archivo.name);
      } else {
        res = await obtenerMixtas(archivo.name);
      }

      setResultado(res.data);
    } catch (err: any) {
      setResultado({
        error: err.response?.data?.error || 'Error desconocido',
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <input
        type="file"
        accept=".mid"
        onChange={e => setArchivo(e.target.files?.[0] || null)}
      />

      <div className="flex gap-2">
        <button
          onClick={() => setModo('global')}
          className={`px-3 py-1 rounded ${
            modo === 'global' ? 'bg-blue-700' : 'bg-blue-500'
          } text-white`}
        >
          Global
        </button>
        <button
          onClick={() => setModo('compases')}
          className={`px-3 py-1 rounded ${
            modo === 'compases' ? 'bg-green-700' : 'bg-green-500'
          } text-white`}
        >
          Compases
        </button>
        <button
          onClick={() => setModo('mixtas')}
          className={`px-3 py-1 rounded ${
            modo === 'mixtas' ? 'bg-purple-700' : 'bg-purple-500'
          } text-white`}
        >
          Mixtas
        </button>
      </div>

      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Analizar
      </button>

      {resultado && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
          {JSON.stringify(resultado, null, 2)}
        </pre>
      )}
    </div>
  );
}