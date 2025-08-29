import { useState } from 'react';
import { useMidiAnalysis } from '../hooks/useMidiAnalysis';

const CATEGORIAS = [
  'instrumentales',
  'melodicas',
  'ritmicas',
  'armonicas',
  'texturales',
  'formales',
  'interaccion',
  'comparativas',
  'diferenciadoras',
];

const MODOS = ['global', 'compases', 'mixtas', 'todos'];

export default function MidiAnalyzer() {
  const {
    archivo,
    setArchivo,
    subirYPreparar,
    analizar,
    resultado,
    modo,
    setModo,
    categoria,
    setCategoria,
    instrumentosDetectados,
    instrumentoPendiente,
    setInstrumentoPendiente,
    setInstrumentoSeleccionado,
    cargando,
  } = useMidiAnalysis();

  const [mostrarSelector, setMostrarSelector] = useState(false);

  const iniciarAnalisis = () => {
    const instrumentoFinal = instrumentoPendiente.trim();
    setInstrumentoSeleccionado(instrumentoFinal); // actualiza el estado visible
    analizar(instrumentoFinal); // ejecuta el análisis con '' si no hay filtro
  };

  return (
    <div className="p-4 space-y-4">
      <input
        type="file"
        accept=".mid"
        onChange={e => {
          const file = e.target.files?.[0] || null;
          if (file) subirYPreparar(file);
        }}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Seleccionar categoría de métricas
        </label>
        <select
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          {CATEGORIAS.map((cat, index) => (
            <option key={index} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Seleccionar modo de análisis
        </label>
        <select
          value={modo}
          onChange={e => setModo(e.target.value as typeof modo)}
          className="px-2 py-1 border rounded"
        >
          {MODOS.map((m, index) => (
            <option key={index} value={m}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {archivo && (
        <div className="space-y-2">
          <button
            onClick={() => setMostrarSelector(!mostrarSelector)}
            className="px-3 py-1 bg-gray-700 text-white rounded"
          >
            Seleccionar instrumento
          </button>

          {mostrarSelector && (
            <select
              value={instrumentoPendiente}
              onChange={e => setInstrumentoPendiente(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              <option value="">-- Sin filtro de instrumento --</option>
              {instrumentosDetectados.map((nombre, index) => (
                <option key={index} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={iniciarAnalisis}
            className="px-3 py-1 bg-green-600 text-white rounded"
            disabled={cargando}
          >
            Iniciar análisis
          </button>

          <p className="text-sm text-gray-700">
            Instrumento seleccionado:{' '}
            <strong>{instrumentoPendiente.trim() || 'Todos'}</strong>
          </p>
        </div>
      )}

      {resultado && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
          {JSON.stringify(resultado, null, 2)}
        </pre>
      )}

      {cargando && (
        <p className="text-sm text-blue-600">Analizando archivo...</p>
      )}
    </div>
  );
}