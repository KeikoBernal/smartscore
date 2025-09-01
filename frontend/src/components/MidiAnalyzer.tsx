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
  'todas', // Esta es la categoría "todas" que ya existía para el frontend
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

// Tipos para estructuras conocidas de métricas
interface CantidadTotalNotas {
  total: number;
  por_nota: Record<string, number>;
}

interface MotivoRecurrente {
  conteo: number;
  notacion: string[];
}

interface MotivosRecurrentes {
  [motivo: string]: MotivoRecurrente;
}

interface IntervalosPredominantes {
  valores: number[];
  predominantes: number[];
  nombres: string[];
}

interface ProgresionesArmonicas {
  acordes: Record<string, number>;
  progresiones_2_acordes: Record<string, number>;
}

const chartConfig: Record<string, Record<string, string>> = {
  instrumentales: {
    instrumentos_detectados: 'bar',
    cantidad_total_notas: 'doughnut',
    partes_detectadas: 'bar',
    porcentaje_participacion: 'pie',
    familias_instrumentales: 'bar',
    balance_dinamico: 'radar',
    compases_no_vacios_por_instrumento: 'bar',
  },
  melodicas: {
    entropia_melodica: 'line',
    intervalos_predominantes: 'bar',
    motivos_recurrentes: 'bar',
    variedad_tonal: 'pie',
    compacidad_melodica: 'radar',
    repetitividad_motívica: 'bar',
    promedio_notas_por_compas: 'bar',
    varianza_notas_por_compas: 'bar',
    compacidad_melodica_por_compas: 'line',
    repetitividad_motívica_por_compas: 'line',
    cantidad_notas_por_compas: 'line',
  },
  ritmicas: {
    entropia_ritmica: 'line',
    firma_metrica: 'bar',
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
    seccion_aurea: 'bar',
    compases_estimados: 'bar',
  },
  interaccion: {
    entropia_interaccion: 'line',
    red_interaccion_musical: 'bar',
    sincronizacion_entrada: 'line',
    sincronizacion_entrada_por_compas: 'line',
    dispersion_temporal_por_compas: 'line',
  },
  comparativas: {
    tempo_promedio: 'bar',
    duracion_segundos: 'bar',
    promedio_rango_dinamico: 'line',
    promedio_rango_dinamico_por_compas: 'line',
  },
  diferenciadoras: {
    variabilidad_intervalica: 'bar',
    variabilidad_intervalica_por_compas: 'line',  },
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
  const [tipoGraficaEscalares, setTipoGraficaEscalares] = useState<
    'bar' | 'radar' | 'line' | 'doughnut' | 'pie'
  >('bar');

  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.mid')) {
      subirYPreparar(file);
    }
  };

  const iniciarAnalisis = () => {
    const instrumentoFinal = instrumentoPendiente.trim();
    setInstrumentoSeleccionado(instrumentoFinal);
    analizar(instrumentoFinal);
  };

  const exportarCSV = () => {
    if (!resultado?.metricas) return;

    const filas = Object.entries(resultado.metricas).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          return value
            .map((item) => {
              const itemKey = Object.keys(item)[0];
              const itemValue = item[itemKey];
              return `${key}.${itemKey},${itemValue}`;
            })
            .join('\n');
        } else if (
          key === 'cantidad_total_notas' &&
          'total' in value &&
          'por_nota' in value
        ) {
          const val = value as CantidadTotalNotas;
          let subRows = [`${key}.total,${val.total}`];
          for (const noteKey in val.por_nota) {
            subRows.push(`${key}.por_nota.${noteKey},${val.por_nota[noteKey]}`);
          }
          return subRows.join('\n');
        } else if (
          key === 'motivos_recurrentes' ||
          key === 'intervalos_predominantes' ||
          key === 'progresiones_armonicas'
        ) {
          let subRows: string[] = [];
          const valueObj = value as Record<string, any>;
          for (const subKey in valueObj) {
            if (
              typeof valueObj[subKey] === 'object' &&
              valueObj[subKey] !== null
            ) {
              for (const deepKey in valueObj[subKey]) {
                subRows.push(`${key}.${subKey}.${deepKey},${valueObj[subKey][deepKey]}`);
              }
            } else {
              subRows.push(`${key}.${subKey},${valueObj[subKey]}`);
            }
          }
          return subRows.join('\n');
        } else {
          return Object.entries(value)
            .map(([subkey, subval]) => `${key}.${subkey},${subval}`)
            .join('\n');
        }
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
    // Sección Áurea (global)
    if (key === 'seccion_aurea' && typeof value === 'number') {
      let totalCompases = 100;
      if (resultado?.metricas?.compases_estimados) {
        if (typeof resultado.metricas.compases_estimados === 'number') {
          totalCompases = resultado.metricas.compases_estimados;
        } else if (
          typeof resultado.metricas.compases_estimados === 'object' &&
          resultado.metricas.compases_estimados !== null
        ) {
          totalCompases =
            Object.values(resultado.metricas.compases_estimados)[0] as number || 100;
        }
      }

      const aurea = value;
      const labels = Array.from({ length: totalCompases }, (_, i) => i + 1);
      const data = labels.map((x) => (x === Math.round(aurea) ? 1 : 0));

      return (
        <div className="mb-4" key={`aurea-${key}`}>
          <h4 className="text-sm font-semibold mb-1">Sección Áurea (Global)</h4>
          <Line
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

    // Red de Interacción Musical
    if (
      key === 'red_interaccion_musical' &&
      typeof value === 'object' &&
      value !== null
    ) {
      return (
        <div className="mb-4" key={`red-${key}`}>
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

    // Motivos Recurrentes
    if (
      key === 'motivos_recurrentes' &&
      typeof value === 'object' &&
      value !== null
    ) {
      const val = value as MotivosRecurrentes;
      const labels = Object.keys(val);
      const data = labels.map((label) => val[label]?.conteo || 0);
      const notation = labels.map((label) => val[label]?.notacion?.join(' ') || '');

      return (
        <div className="mb-4" key={`motivos-${key}`}>
          <h4 className="text-sm font-semibold mb-1">Motivos Recurrentes</h4>
          <Bar
            data={{
              labels: labels.map((l, i) => `${l} (${notation[i]})`),
              datasets: [
                {
                  label: 'Conteo',
                  data,
                  backgroundColor: 'rgba(153, 102, 255, 0.6)',
                },
              ],
            }}
            options={{
              responsive: true,
              animation: { duration: 800, easing: 'easeOutQuart' as const },
              plugins: { legend: { display: true, position: 'top' as const } },
            }}
          />
        </div>
      );
    }

    // Intervalos Predominantes
    if (
      key === 'intervalos_predominantes' &&
      typeof value === 'object' &&
      value !== null &&
      'valores' in value &&
      'nombres' in value
    ) {
      const val = value as IntervalosPredominantes;
      const intervalCounts = val.valores.reduce(
        (acc: Record<string, number>, valNum: number, idx: number) => {
          const name = val.nombres[idx] || `Intervalo ${valNum}`;
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        },
        {}
      );

      const labels = Object.keys(intervalCounts);
      const data = Object.values(intervalCounts);

      return (
        <div className="mb-4" key={`intervalos-${key}`}>
          <h4 className="text-sm font-semibold mb-1">Intervalos Predominantes</h4>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: 'Frecuencia',
                  data: data as number[],
                  backgroundColor: 'rgba(255, 159, 64, 0.6)',
                },
              ],
            }}
            options={{
              responsive: true,
              animation: { duration: 800, easing: 'easeOutQuart' as const },
              plugins: { legend: { display: true, position: 'top' as const } },
            }}
          />
        </div>
      );
    }

    // Progresiones Armónicas
    if (
      key === 'progresiones_armonicas' &&
      typeof value === 'object' &&
      value !== null &&
      'progresiones_2_acordes' in value
    ) {
      const val = value as ProgresionesArmonicas;
      const labels = Object.keys(val.progresiones_2_acordes);
      const data = Object.values(val.progresiones_2_acordes);

      return (
        <div className="mb-4" key={`progresiones-${key}`}>
          <h4 className="text-sm font-semibold mb-1">Progresiones Armónicas (3 acordes)</h4>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: 'Conteo',
                  data: data as number[],
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
              ],
            }}
            options={{
              responsive: true,
              animation: { duration: 800, easing: 'easeOutQuart' as const },
              plugins: { legend: { display: true, position: 'top' as const } },
            }}
          />
        </div>
      );
    }

    // Cantidad Total de Notas
    if (
      key === 'cantidad_total_notas' &&
      typeof value === 'object' &&
      value !== null &&
      'total' in value &&
      'por_nota' in value
    ) {
      const val = value as CantidadTotalNotas;
      const labels = Object.keys(val.por_nota);
      const data = Object.values(val.por_nota);

      return (
        <div className="mb-4" key={`notas-total-${key}`}>
          <h4 className="text-sm font-semibold mb-1">Cantidad de Notas por Tono</h4>
          <Doughnut
            data={{
              labels,
              datasets: [
                {
                  label: 'Notas',
                  data: data as number[],
                  backgroundColor: labels.map((_, i) => `hsl(${i * 30}, 70%, 60%)`),
                },
              ],
            }}
            options={{
              responsive: true,
              animation: { duration: 800, easing: 'easeOutQuart' as const },
              plugins: { legend: { display: true, position: 'top' as const } },
            }}
          />
        </div>
      );
    }

    // Familias Instrumentales
    if (
      key === 'familias_instrumentales' &&
      typeof value === 'object' &&
      value !== null
    ) {
      const labels = Object.keys(value);
      const data = labels.map((label) => value[label].length);

      return (
        <div className="mb-4" key={`familias-${key}`}>
          <h4 className="text-sm font-semibold mb-1">Familias Instrumentales</h4>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: 'Número de Instrumentos',
                  data,
                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                },
              ],
            }}
            options={{
              responsive: true,
              animation: { duration: 800, easing: 'easeOutQuart' as const },
              plugins: { legend: { display: true, position: 'top' as const } },
            }}
          />
        </div>
      );
    }

    // Partes Detectadas
    if (key === 'partes_detectadas' && Array.isArray(value)) {
      const labels = value.map((part: any) => part.nombre);
      const data = value.map((part: any) => part.notas);

      return (
        <div className="mb-4" key={`partes-${key}`}>
          <h4 className="text-sm font-semibold mb-1">Notas por Parte Detectada</h4>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: 'Cantidad de Notas',
                  data,
                  backgroundColor: 'rgba(255, 99, 132, 0.6)',
                },
              ],
            }}
            options={{
              responsive: true,
              animation: { duration: 800, easing: 'easeOutQuart' as const },
              plugins: { legend: { display: true, position: 'top' as const } },
            }}
          />
        </div>
      );
    }

    // Listas de objetos (métricas por compás)
    if (
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === 'object' &&
      value[0] !== null
    ) {
      const labels = value.map((item) => Object.keys(item)[0]);
      const data = value.map((item) => Object.values(item)[0]);
      // Si la categoría es 'todos', no hay un chartConfig específico, se usa 'line' por defecto
      const tipo = chartTypes[key] || chartConfig[categoria]?.[key] || 'line';

      const dataset = {
        label: key,
        data: data as number[],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
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
        <div className="mb-6" key={`compas-${key}`}>
          <h4 className="text-sm font-semibold mb-1">{key} (Por Compás)</h4>
          <div className="mb-2">
            <label className="text-xs mr-2">Tipo de gráfica:</label>
            <select
              value={chartTypes[key] || tipo}
              onChange={(e) =>
                setChartTypes((prev) => ({ ...prev, [key]: e.target.value }))
              }
              className="text-xs px-1 py-0.5 border rounded"
            >
              <option value="line">Line</option>
              <option value="bar">Bar</option>
            </select>
          </div>
          {{
            line: <Line key={`${key}-line`} {...chartProps} />,
            bar: <Bar key={`${key}-bar`} {...chartProps} />,
          }[chartTypes[key] || tipo]}
        </div>
      );
    }

    // Objetos/diccionarios (métricas tipo {clave: valor})
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const obj = value as Record<string, any>;
      const labels = Object.keys(obj);
      const data = labels.map((label) =>
        typeof obj[label] === 'number' ? obj[label] : 0
      );

      // Si la categoría es 'todos', no hay un chartConfig específico, se usa 'bar' por defecto
      const tipo = chartTypes[key] || chartConfig[categoria]?.[key] || 'bar';

      const dataset = {
        label: key,
        data,
        backgroundColor: labels.map((_, i) => `hsl(${i * 60}, 70%, 60%)`),
        borderColor: labels.map((_, i) => `hsl(${i * 60}, 70%, 40%)`),
        borderWidth: 1,
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
        <div className="mb-6" key={`obj-${key}`}>
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
              <option value="pie">Pie</option>
              <option value="doughnut">Doughnut</option>
              <option value="radar">Radar</option>
            </select>
          </div>
          {{
            bar: <Bar key={`${key}-bar`} {...chartProps} />,
            pie: <Pie key={`${key}-pie`} {...chartProps} />,
            doughnut: <Doughnut key={`${key}-doughnut`} {...chartProps} />,
            radar: <Radar key={`${key}-radar`} {...chartProps} />,
          }[chartTypes[key] || tipo]}
        </div>
      );
    }

    // Si no es número ni objeto ni array, no renderizar gráfico
    return null;
  };

  const metricasEscalares = obtenerMetricasEscalares();

  return (
    <div className="app-layout">
      {/* Cabecera */}
      <header className="app-header">
        <h1 className="app-title">SmartScore Analyzer</h1>
        <div className="header-controls">
          <div className="control-group">
            <label className="control-label">Modo de análisis:</label>
            <select
              value={modo}
              onChange={(e) => setModo(e.target.value as typeof modo)}
              className="control-select"
            >
              {MODOS.map((m, index) => (
                <option key={index} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {archivo && (
            <div className="control-group">
              <button
                onClick={() => setMostrarSelector(!mostrarSelector)}
                className="control-button"
              >
                Seleccionar instrumento
              </button>
              {mostrarSelector && (
                <select
                  value={instrumentoPendiente}
                  onChange={(e) => setInstrumentoPendiente(e.target.value)}
                  className="control-select"
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
                className="control-button primary"
                disabled={cargando}
              >
                Iniciar análisis
              </button>
              <p className="control-info">
                Instrumento seleccionado:{' '}
                <strong>{instrumentoPendiente.trim() || 'Todos'}</strong>
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="main-content">
        {/* Área Principal (Izquierda) */}
        <main className="main-area">
          {Object.keys(metricasEscalares).length > 0 && (
            <div className="chart-section">
              <h4 className="section-title">Métricas escalares agrupadas</h4>
              <div className="chart-type-selector">
                <label className="chart-label">Tipo de gráfica:</label>
                <select
                  value={tipoGraficaEscalares}
                  onChange={(e) =>
                    setTipoGraficaEscalares(e.target.value as typeof tipoGraficaEscalares)
                  }
                  className="chart-select"
                >
                  <option value="bar">Bar</option>
                  <option value="line">Line</option>
                  <option value="radar">Radar</option>
                  <option value="doughnut">Doughnut</option>
                  <option value="pie">Pie</option>
                </select>
              </div>

              {{
                bar: (
                  <Bar
                    key="escalares-bar"
                    data={{
                      labels: Object.keys(metricasEscalares),
                      datasets: [
                        {
                          label: 'Métricas escalares',
                          data: Object.values(metricasEscalares),
                          backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        },
                      ],
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
                  />
                ),
                line: (
                  <Line
                    key="escalares-line"
                    data={{
                      labels: Object.keys(metricasEscalares),
                      datasets: [
                        {
                          label: 'Métricas escalares',
                          data: Object.values(metricasEscalares),
                          backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        },
                      ],
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
                  />
                ),
                radar: (
                  <Radar
                    key="escalares-radar"
                    data={{
                      labels: Object.keys(metricasEscalares),
                      datasets: [
                        {
                          label: 'Métricas escalares',
                          data: Object.values(metricasEscalares),
                          backgroundColor: 'rgba(54, 162, 235, 0.4)',
                          borderColor: 'rgba(54, 162, 235, 1)',
                        },
                      ],
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
                  />
                ),
                doughnut: (
                  <Doughnut
                    key="escalares-doughnut"
                    data={{
                      labels: Object.keys(metricasEscalares),
                      datasets: [
                        {
                          label: 'Métricas escalares',
                          data: Object.values(metricasEscalares),
                          backgroundColor: Object.keys(metricasEscalares).map(
                            () => 'rgba(54, 162, 235, 0.6)'
                          ),
                        },
                      ],
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
                  />
                ),
                pie: (
                  <Pie
                    key="escalares-pie"
                    data={{
                      labels: Object.keys(metricasEscalares),
                      datasets: [
                        {
                          label: 'Métricas escalares',
                          data: Object.values(metricasEscalares),
                          backgroundColor: Object.keys(metricasEscalares).map(
                            () => 'rgba(54, 162, 235, 0.6)'
                          ),
                        },
                      ],
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
                  />
                ),
              }[tipoGraficaEscalares]}
            </div>
          )}

          {resultado?.metricas && (
            <>
              <div className="charts-grid">
                {Object.entries(resultado.metricas)
                .filter(([key]) => categoria === 'todas' || chartConfig[categoria]?.[key])
                .map(([key, value]) => renderMetricChart(key, value))}
              </div>

              <button
                onClick={exportarCSV}
                className="export-button"
              >
                Exportar métricas como CSV
              </button>
            </>
          )}

          {resultado && (
            <pre className="result-json">
              {JSON.stringify(resultado, null, 2)}
            </pre>
          )}

          {cargando && (
            <div className="loading-indicator">
              <svg
                className="spinner"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Procesando archivo MIDI...
            </div>
          )}
        </main>

        {/* Barra Lateral Derecha */}
        <aside className="sidebar-right">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Subir Archivo MIDI</h3>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`drag-drop-area ${isDragActive ? 'active' : ''}`}
            >
              <p>Arrastra aquí tu archivo MIDI (.mid)</p>
            </div>

            <div className="file-upload-controls">
              <button
                onClick={() => document.getElementById('midi-upload')?.click()}
                className="upload-button"
              >
                Elegir archivo MIDI
              </button>
              {archivo && (
                <span className="file-name">
                  Archivo: <strong>{archivo.name}</strong>
                </span>
              )}
            </div>
            <input
              type="file"
              accept=".mid"
              id="midi-upload"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file) subirYPreparar(file);
              }}
            />
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Categorías de Métricas</h3>
            <div className="category-buttons">
              {CATEGORIAS.map((cat, index) => (
                <button
                  key={index}
                  onClick={() => setCategoria(cat as typeof categoria)}
                  className={`category-button ${categoria === cat ? 'active' : ''}`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}