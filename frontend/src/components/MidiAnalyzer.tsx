import { useState } from 'react';
import { useMidiAnalysis } from '../hooks/useMidiAnalysis';
import {
  Bar,
  Line,
  Pie,
  Radar,
  Doughnut,
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend
);

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

const chartConfig: Record<string, Record<string, string>> = {
  instrumentales: {
    instrumentos_detectados: 'bar',
    cantidad_total_notas: 'doughnut',
    partes_detectadas: 'bar',
    porcentaje_participacion: 'pie',
    familias_instrumentales: 'bar',
    balance_dinamico: 'radar',
  },
  melodicas: {
    entropia_melodica: 'line',
    intervalos_predominantes: 'bar',
    motivos_recurrentes: 'bubble',
    variedad_tonal: 'pie',
    compacidad_melodica: 'radar',
    repetitividad_motívica: 'bar',
    promedio_notas_por_compas: 'bar',
    varianza_notas_por_compas: 'bar',
  },
  ritmicas: {
    entropia_ritmica: 'line',
    firma_metrica: 'bar',
    entropia_duracion: 'line',
    promedio_notas_por_compas: 'bar',
    varianza_notas_por_compas: 'bar',
  },
  armonicas: {
    entropia_armonica: 'line',
    progresiones_armonicas: 'bar',
    densidad_armonica: 'bar',
    innovacion_estadistica: 'bar',
  },
  texturales: {
    contrapunto_activo: 'radar',
    firma_fractal: 'line',
    complejidad_total: 'bar',
  },
  formales: {
    seccion_aurea: 'line',
    compases_estimados: 'bar',
  },
  interaccion: {
    entropia_interaccion: 'line',
    red_interaccion_musical: 'bar',
    sincronizacion_entrada: 'line',
    dispersión_temporal: 'bar',
  },
  comparativas: {
    tempo_promedio: 'bar',
    duracion_segundos: 'bar',
    promedio_rango_dinamico: 'line',
  },
  diferenciadoras: {
    variabilidad_intervalica: 'bar',
    entropia_compuesta: 'radar',
  },
};

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
  const [chartTypes, setChartTypes] = useState<Record<string, string>>({});
  const [tipoGraficaEscalares, setTipoGraficaEscalares] = useState<'bar' | 'radar' | 'line' | 'doughnut' | 'pie'>('bar');

  const iniciarAnalisis = () => {
    const instrumentoFinal = instrumentoPendiente.trim();
    setInstrumentoSeleccionado(instrumentoFinal);
    analizar(instrumentoFinal);
  };

  const exportarCSV = () => {
    if (!resultado?.metricas) return;

    const filas = Object.entries(resultado.metricas).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return Object.entries(value)
          .map(([subkey, subval]) => `${key}.${subkey},${subval}`)
          .join('\n');
      }
      return `${key},${value}`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + filas.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${resultado.archivo || 'metricas'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const obtenerMetricasEscalares = () => {
    if (!resultado?.metricas) return {};
    const escalares: Record<string, number> = {};
    Object.entries(resultado.metricas).forEach(([key, value]) => {
      if (typeof value === 'number') {
        escalares[key] = value;
      }
    });
    return escalares;
  };

  const renderMetricChart = (key: string, value: any) => {
    if (key === 'seccion_aurea' && typeof value === 'number') {
      const total = resultado?.metricas?.compases_estimados || 100;
      const aurea = value;
      const labels = Array.from({ length: total }, (_, i) => i + 1);
      const data = labels.map((x) => (x === Math.round(aurea) ? 1 : 0));

      return (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-1">Sección Áurea</h4>
          <Line
            key={`aurea-${key}`}
            data={{
              labels,
              datasets: [
                {
                  label: 'Marcador áureo',
                  data,
                  borderColor: 'rgba(255, 99, 132, 0.8)',
                  backgroundColor: 'rgba(255, 99, 132, 0.4)',
                  pointRadius: 5,
                  pointBackgroundColor: 'red',
                  fill: false,
                },
              ],
            }}
            options={{
              responsive: true,
              animation: {
                duration: 800,
                easing: 'easeOutQuart' as const,
              },
              scales: {
                y: { display: false },
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'top' as const,
                },
              },
            }}
          />
        </div>
      );
    }

    if (key === 'red_interaccion_musical' && typeof value === 'object') {
      return (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-1">Red de interacción musical</h4>
          <table className="text-xs border w-full">
            <thead>
              <tr>
                <th className="border px-2 py-1">Par</th>
                <th className="border px-2 py-1">Interacciones</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(value).map(([par, count], i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{par}</td>
                  <td className="border px-2 py-1">{String(count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    const tipo = chartTypes[key] || chartConfig[categoria]?.[key] || 'bar';
    const labels = typeof value === 'object' && value !== null ? Object.keys(value) : [key];
    const data = typeof value === 'object' && value !== null ? Object.values(value).map(v => typeof v === 'number' ? v : 0) : [typeof value === 'number' ? value : 0];

    const dataset = {
      label: key,
      data,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    };

    const chartProps = {
      data: { labels, datasets: [dataset] },
      options: {
        responsive: true,
        animation: {
          duration: 800,
          easing: 'easeOutQuart' as const,
        },
        plugins: {
          legend: {
            display: true,
                        position: 'top' as const,
          },
        },
      },
    };

    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-1">{key}</h4>
        <div className="mb-2">
          <label className="text-xs mr-2">Tipo de gráfica:</label>
          <select
            value={chartTypes[key] || tipo}
            onChange={(e) =>
              setChartTypes((prev) => ({ ...prev, [key]: e.target.value }))
            }
            className="text-xs px-1 py-0.5 border rounded"
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
            <option value="doughnut">Doughnut</option>
            <option value="radar">Radar</option>
          </select>
        </div>
        {{
          bar: <Bar key={`${key}-bar`} {...chartProps} />,
          line: <Line key={`${key}-line`} {...chartProps} />,
          pie: <Pie key={`${key}-pie`} {...chartProps} />,
          doughnut: <Doughnut key={`${key}-doughnut`} {...chartProps} />,
          radar: <Radar key={`${key}-radar`} {...chartProps} />,
        }[chartTypes[key] || tipo]}
      </div>
    );
  };

  const metricasEscalares = obtenerMetricasEscalares();

  return (
    <div className="p-4 space-y-4">
      <input
        type="file"
        accept=".mid"
        onChange={(e) => {
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
          onChange={(e) => setCategoria(e.target.value)}
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
          onChange={(e) => setModo(e.target.value as typeof modo)}
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
              onChange={(e) => setInstrumentoPendiente(e.target.value)}
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

      {Object.keys(metricasEscalares).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2">Métricas escalares agrupadas</h4>
          <div className="mb-2">
            <label className="text-xs mr-2">Tipo de gráfica:</label>
            <select
              value={tipoGraficaEscalares}
              onChange={(e) =>
                setTipoGraficaEscalares(e.target.value as typeof tipoGraficaEscalares)
              }
              className="text-xs px-1 py-0.5 border rounded"
            >
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="radar">Radar</option>
              <option value="doughnut">Doughnut</option>
              <option value="pie">Pie</option>
            </select>
          </div>

          {{
            bar: <Bar
              key="escalares-bar"
              data={{
                labels: Object.keys(metricasEscalares),
                datasets: [{
                  label: 'Métricas escalares',
                  data: Object.values(metricasEscalares),
                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                }],
              }}
              options={{
                responsive: true,
                animation: {
                  duration: 800,
                  easing: 'easeOutQuart' as const,
                },
                plugins: {
                  legend: {
                    display: true,
                    position: 'top' as const,
                  },
                },
              }}
            />,
            line: <Line key="escalares-line" {...{
              data: {
                labels: Object.keys(metricasEscalares),
                datasets: [{
                  label: 'Métricas escalares',
                  data: Object.values(metricasEscalares),
                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                }],
              },
              options: {
                responsive: true,
                animation: {
                  duration: 800,
                  easing: 'easeOutQuart' as const,
                },
                plugins: {
                  legend: {
                    display: true,
                    position: 'top' as const,
                  },
                },
              },
            }} />,
            radar: <Radar key="escalares-radar" {...{
              data: {
                labels: Object.keys(metricasEscalares),
                datasets: [{
                  label: 'Métricas escalares',
                  data: Object.values(metricasEscalares),
                  backgroundColor: 'rgba(54, 162, 235, 0.4)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                }],
              },
              options: {
                responsive: true,
                animation: {
                  duration: 800,
                  easing: 'easeOutQuart' as const,
                },
                plugins: {
                  legend: {
                    display: true,
                    position: 'top' as const,
                  },
                },
              },
            }} />,
            doughnut: <Doughnut key="escalares-doughnut" {...{
              data: {
                labels: Object.keys(metricasEscalares),
                datasets: [{
                  label: 'Métricas escalares',
                  data: Object.values(metricasEscalares),
                  backgroundColor: Object.keys(metricasEscalares).map(() => 'rgba(54, 162, 235, 0.6)'),
                }],
              },
              options: {
                responsive: true,
                animation: {
                  duration: 800,
                  easing: 'easeOutQuart' as const,
                },
                plugins: {
                  legend: {
                    display: true,
                    position: 'top' as const,
                  },
                },
              },
            }} />,
            pie: <Pie key="escalares-pie" {...{
              data: {
                labels: Object.keys(metricasEscalares),
                datasets: [{
                  label: 'Métricas escalares',
                  data: Object.values(metricasEscalares),
                  backgroundColor: Object.keys(metricasEscalares).map(() => 'rgba(54, 162, 235, 0.6)'),
                }],
              },
              options: {
                responsive: true,
                animation: {
                  duration: 800,
                  easing: 'easeOutQuart' as const,
                },
                plugins: {
                  legend: {
                    display: true,
                    position: 'top' as const,
                  },
                },
              },
            }} />,
          }[tipoGraficaEscalares]}
        </div>
      )}

      {resultado?.metricas && (
        <>
          <div className="space-y-4">
            {Object.entries(resultado.metricas).map(([key, value]) =>
              typeof value === 'number' ? null : renderMetricChart(key, value)
            )}
          </div>

          <button
            onClick={exportarCSV}
            className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
            Exportar métricas como CSV
          </button>
        </>
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