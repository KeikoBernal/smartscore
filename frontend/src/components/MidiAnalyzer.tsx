// /src/components/MidiAnalyzer.tsx
import { useState, useRef, useEffect } from 'react';
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
import * as d3 from 'd3';

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
    variabilidad_intervalica_por_compas: 'line',
  },
};

// D3 Chord Chart Component
interface ChordChartProps {
  data: Record<string, number>;
  title: string;
}

const ChordChart: React.FC<ChordChartProps> = ({ data, title }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const outerRadius = Math.min(width, height) * 0.5 - 30;
    const innerRadius = outerRadius - 20;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

    const labels = Array.from(new Set(Object.keys(data).flatMap(d => d.split('-'))));
    const nameToIndex = new Map(labels.map((name, i) => [name, i]));
    const matrix = Array.from({ length: labels.length }, () => Array(labels.length).fill(0));

    for (const key in data) {
      const [source, target] = key.split('-');
      const value = data[key];
      if (nameToIndex.has(source) && nameToIndex.has(target)) {
        matrix[nameToIndex.get(source)!][nameToIndex.get(target)!] += value;
        matrix[nameToIndex.get(target)!][nameToIndex.get(source)!] += value; // Para grafo no dirigido
      }
    }

    const chord = d3.chordDirected()
      .padAngle(10 / innerRadius)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending)(matrix);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const ribbon = d3.ribbonArrow()
      .radius(innerRadius - 1)
      .padAngle(1 / innerRadius);

    const color = d3.scaleOrdinal(labels, d3.schemeCategory10);

    const group = svg.append('g')
      .selectAll('g')
      .data(chord.groups)
      .join('g');

    group.append('path')
      .attr('fill', d => color(labels[d.index]) as string)
      .attr('stroke', d => d3.rgb(color(labels[d.index]) as string).darker() as any)
      .attr('d', arc as any);

    // No mostrar etiquetas en el gráfico para evitar sobrecarga visual

    svg.append('g')
      .attr('fill-opacity', 0.7)
      .selectAll('path')
      .data(chord)
      .join('path')
      .style('mix-blend-mode', 'multiply')
      .attr('fill', d => color(labels[d.source.index]) as string)
      .attr('d', ribbon as any)
      .append('title')
      .text(d => `${labels[d.source.index]} -> ${labels[d.target.index]}: ${d.source.value}\n${labels[d.target.index]} -> ${labels[d.source.index]}: ${d.target.value}`);

  }, [data]);

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold mb-1">{title}</h4>
      <svg ref={svgRef}></svg>
      <div className="chord-legend mt-2 flex flex-wrap gap-2 max-w-[400px]">
        {Array.from(new Set(Object.keys(data).flatMap(d => d.split('-')))).map((label, i) => (
          <div key={label} className="legend-item flex items-center gap-2 text-xs">
            <span
              className="legend-color-block"
              style={{ backgroundColor: d3.schemeCategory10[i % 10] }}
            />
            <span className="legend-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// D3 Heatmap Component
interface HeatmapProps {
  data: { compas: string; value: number }[];
  title: string;
}

const Heatmap: React.FC<HeatmapProps> = ({ data, title }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [colorDomain, setColorDomain] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 30, right: 30, bottom: 30, left: 60 };
    const cellSize = 40; // Cuadrados más grandes
    const cols = 10; // 10 cuadrados de ancho
    const rows = Math.ceil(data.length / cols);
    const width = cols * cellSize;
    const height = rows * cellSize;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + 50) // espacio extra para leyenda
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const values = data.map(d => d.value);

    const minVal = d3.min(values) || 0;
    const maxVal = d3.max(values) || 1;
    setColorDomain([minVal, maxVal]);

    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([minVal, maxVal]);

    // Crear grupos para cada celda
    const cells = svg.selectAll('g.cell')
      .data(data)
      .join('g')
      .attr('class', 'cell')
      .attr('transform', (_, i) => {
        const x = (i % cols) * cellSize;
        const y = Math.floor(i / cols) * cellSize;
        return `translate(${x},${y})`;
      });

    cells.append('rect')
      .attr('width', cellSize - 4)
      .attr('height', cellSize - 4)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', d => colorScale(d.value));

    // Etiquetas de compás solo al inicio de cada fila (cada múltiplo de cols)
    const rowsCount = rows;
    const rowLabels = svg.selectAll('text.row-label')
      .data(d3.range(rowsCount))
      .join('text')
      .attr('class', 'row-label')
      .attr('x', -10)
      .attr('y', d => d * cellSize + (cellSize / 2))
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-size', 12)
      .attr('fill', '#444')
      .text(d => `Compás ${d * cols + 1}`);

    // Leyenda de colores
    const legendWidth = width * 0.8;
    const legendHeight = 10;
    const legendMarginTop = height + 20;

    // Crear grupo para leyenda
    const legendGroup = svg.append('g')
      .attr('transform', `translate(${(width - legendWidth) / 2},${legendMarginTop})`);

    // Crear gradiente
    const defs = svg.append('defs');
    const gradientId = 'legend-gradient';

    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');

    // Añadir stops al gradiente
    const stops = d3.range(0, 1.01, 0.1);
    stops.forEach(t => {
      gradient.append('stop')
        .attr('offset', `${t * 100}%`)
        .attr('stop-color', d3.interpolateViridis(t));
    });

    // Rectángulo con gradiente
    legendGroup.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', `url(#${gradientId})`)
      .style('stroke', '#ccc')
      .style('stroke-width', 1)
      .attr('rx', 4)
      .attr('ry', 4);

    // Escala para eje leyenda
    const legendScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([0, legendWidth]);

    // Eje leyenda
    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format('.2f'));

    legendGroup.append('g')
      .attr('transform', `translate(0,${legendHeight})`)
      .call(legendAxis)
      .selectAll('text')
      .style('font-size', '10px');

  }, [data]);

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold mb-1">{title}</h4>
      <svg ref={svgRef}></svg>
    </div>
  );
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

    const flattenObject = (obj: any, prefix = '') => {
      let lines: string[] = [];
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const newKey = prefix ? `${prefix}.${key}` : key;
          const value = obj[key];

          if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                  // Handle array of objects (e.g., partes_detectadas, metrics per compass)
                  const itemKey = Object.keys(item)[0];
                  const itemValue = item[itemKey];
                  lines.push(`${newKey}.${itemKey},${itemValue}`);
                } else {
                  // Handle array of primitives
                  lines.push(`${newKey}[${index}],${item}`);
                }
              });
            } else if (
              newKey === 'cantidad_total_notas' &&
              'total' in value &&
              'por_nota' in value
            ) {
              const val = value as CantidadTotalNotas;
              lines.push(`${newKey}.total,${val.total}`);
              for (const noteKey in val.por_nota) {
                lines.push(`${newKey}.por_nota.${noteKey},${val.por_nota[noteKey]}`);
              }
            } else if (
              newKey === 'motivos_recurrentes' ||
              newKey === 'intervalos_predominantes' ||
              newKey === 'progresiones_armonicas' ||
              newKey === 'red_interaccion_musical' ||
              newKey === 'familias_instrumentales'
            ) {
              // Handle specific complex objects
              for (const subKey in value) {
                if (value.hasOwnProperty(subKey)) {
                  if (typeof value[subKey] === 'object' && value[subKey] !== null) {
                    for (const deepKey in value[subKey]) {
                      if (value[subKey].hasOwnProperty(deepKey)) {
                        lines.push(`${newKey}.${subKey}.${deepKey},${value[subKey][deepKey]}`);
                      }
                    }
                  } else {
                    lines.push(`${newKey}.${subKey},${value[subKey]}`);
                  }
                }
              }
            } else {
              // Recursively flatten other objects
              lines = lines.concat(flattenObject(value, newKey));
            }
          } else {
            lines.push(`${newKey},${value}`);
          }
        }
      }
      return lines;
    };

    const filas = flattenObject(resultado.metricas);
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
    const firma = resultado.metricas.firma_metrica;
      if (firma && typeof firma === 'object' && !Array.isArray(firma)) {
        // Calcular promedio ponderado: sum(key * value) / sum(value)
        const entries = Object.entries(firma).map(([k, v]) => [parseFloat(k), v as number]);
        const totalWeight = entries.reduce((acc, [, val]) => acc + val, 0);
        if (totalWeight > 0) {
          const weightedAvg = entries.reduce((acc, [key, val]) => acc + key * val, 0) / totalWeight;
          escalares.firma_metrica = weightedAvg;
        }
      }
      // Sección áurea si es número
      if (typeof resultado.metricas.seccion_aurea === 'number') {
        escalares.seccion_aurea = resultado.metricas.seccion_aurea;
      }
      Object.entries(resultado.metricas).forEach(([key, value]) => {
        if (typeof value === 'number' && key !== 'firma_metrica' && key !== 'seccion_aurea') {
          escalares[key] = value;
        }
      });
      return escalares;
};

  const renderMetricChart = (key: string, value: any) => {
    // Red de Interacción Musical (Chord Chart)
    if (
      key === 'red_interaccion_musical' &&
      typeof value === 'object' &&
      value !== null
    ) {
      return <ChordChart key={`chord-${key}`} data={value} title="Red de Interacción Musical" />;
    }

    // Progresiones Armónicas (Chord Chart)
    if (
      key === 'progresiones_armonicas' &&
      typeof value === 'object' &&
      value !== null &&
      'progresiones_2_acordes' in value
    ) {
      const val = value as ProgresionesArmonicas;
      // Limitar a las 12 progresiones armónicas más usadas
      const sortedEntries = Object.entries(val.progresiones_2_acordes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12);
      const limitedData = Object.fromEntries(sortedEntries);
      return <ChordChart key={`chord-${key}`} data={limitedData} title="Progresiones Armónicas (Top 12)" />;
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
      const tipo = chartTypes[key] || chartConfig[categoria]?.[key] || 'doughnut';

      const chartProps = {
        data: {
          labels,
          datasets: [
            {
              label: 'Notas',
              data: data as number[],
              backgroundColor: labels.map((_, i) => `hsl(${i * 30}, 70%, 60%)`),
            },
          ],
        },
        options: {
          responsive: true,
          animation: { duration: 800, easing: 'easeOutQuart' as const },
          plugins: { legend: { display: true, position: 'top' as const } },
        },
      };

      return (
        <div className="mb-6" key={`notas-total-${key}`}>
          <h4 className="text-sm font-semibold mb-1">Cantidad de Notas por Tono</h4>
          <div className="mb-2">
            <label className="text-xs mr-2">Tipo de gráfica:</label>
            <select
              value={tipo}
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
          }[tipo]}
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
      const tipo = chartTypes[key] || chartConfig[categoria]?.[key] || 'bar';

      const chartProps = {
        data: {
          labels,
          datasets: [
            {
              label: 'Número de Instrumentos',
              data,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
          ],
        },
        options: {
          responsive: true,
          animation: { duration: 800, easing: 'easeOutQuart' as const },
          plugins: { legend: { display: true, position: 'top' as const } },
        },
      };

      return (
        <div className="mb-6" key={`familias-${key}`}>
          <h4 className="text-sm font-semibold mb-1">Familias Instrumentales</h4>
          <div className="mb-2">
            <label className="text-xs mr-2">Tipo de gráfica:</label>
            <select
              value={tipo}
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
          }[tipo]}
        </div>
      );
    }

    // Partes Detectadas
    if (key === 'partes_detectadas' && Array.isArray(value)) {
      const labels = value.map((part: any) => part.nombre);
      const data = value.map((part: any) => part.notas);
      const tipo = chartTypes[key] || chartConfig[categoria]?.[key] || 'bar';

      const chartProps = {
        data: {
          labels,
          datasets: [
            {
              label: 'Cantidad de Notas',
              data,
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
          ],
        },
        options: {
          responsive: true,
          animation: { duration: 800, easing: 'easeOutQuart' as const },
          plugins: { legend: { display: true, position: 'top' as const } },
        },
      };

      return (
        <div className="mb-6" key={`partes-${key}`}>
          <h4 className="text-sm font-semibold mb-1">Notas por Parte Detectada</h4>
          <div className="mb-2">
            <label className="text-xs mr-2">Tipo de gráfica:</label>
            <select
              value={tipo}
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
          }[tipo]}
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
      const tipo = chartTypes[key] || chartConfig[categoria]?.[key] || 'bar';

      const chartProps = {
        data: {
          labels: labels.map((l, i) => `${l} (${notation[i]})`),
          datasets: [
            {
              label: 'Conteo',
              data,
              backgroundColor: 'rgba(153, 102, 255, 0.6)',
            },
          ],
        },
        options: {
          responsive: true,
          animation: { duration: 800, easing: 'easeOutQuart' as const },
          plugins: { legend: { display: true, position: 'top' as const } },
        },
      };

      return (
        <div className="mb-6" key={`motivos-${key}`}>
          <h4 className="text-sm font-semibold mb-1">Motivos Recurrentes</h4>
          <div className="mb-2">
            <label className="text-xs mr-2">Tipo de gráfica:</label>
            <select
              value={tipo}
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
          }[tipo]}
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
      const tipo = chartTypes[key] || chartConfig[categoria]?.[key] || 'bar';

      const chartProps = {
        data: {
          labels,
          datasets: [
            {
              label: 'Frecuencia',
              data: data as number[],
              backgroundColor: 'rgba(255, 159, 64, 0.6)',
            },
          ],
        },
        options: {
          responsive: true,
          animation: { duration: 800, easing: 'easeOutQuart' as const },
          plugins: { legend: { display: true, position: 'top' as const } },
        },
      };

      return (
        <div className="mb-6" key={`intervalos-${key}`}>
          <h4 className="text-sm font-semibold mb-1">Intervalos Predominantes</h4>
          <div className="mb-2">
            <label className="text-xs mr-2">Tipo de gráfica:</label>
            <select
              value={tipo}
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
          }[tipo]}
        </div>
      );
    }

    // Listas de objetos (métricas por compás)
    const metricsPerCompassKeys = [
      'variabilidad_intervalica_por_compas',
      'varianza_notas_por_compas',
      'dispersion_temporal_por_compas',
      'promedio_rango_dinamico_por_compas',
      'compacidad_melodica_por_compas',
      'repetitividad_motívica_por_compas',
      'cantidad_notas_por_compas',
      'sincronizacion_entrada_por_compas',
    ];

    if (
      metricsPerCompassKeys.includes(key) &&
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === 'object' &&
      value[0] !== null
    ) {
      const labels = value.map((item) => Object.keys(item)[0]);
      const data = value.map((item) => Object.values(item)[0]);
      const tipo = chartTypes[key] || 'line'; // Default to line for per-compass metrics

      const chartProps = {
        data: {
          labels,
          datasets: [
            {
              label: key.replace(/_/g, ' ').replace(' por compas', ''),
              data: data as number[],
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              fill: false,
            },
          ],
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
      };

      return (
        <div className="mb-6" key={`compas-${key}`}>
          <h4 className="text-sm font-semibold mb-1">{key.replace(/_/g, ' ')} (Por Compás)</h4>
          <div className="mb-2">
            <label className="text-xs mr-2">Tipo de gráfica:</label>
            <select
              value={tipo}
              onChange={(e) =>
                setChartTypes((prev) => ({ ...prev, [key]: e.target.value }))
              }
              className="text-xs px-1 py-0.5 border rounded"
            >
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="heatmap">Heatmap</option>
            </select>
          </div>
          {{
            line: <Line key={`${key}-line`} {...chartProps} />,
            bar: <Bar key={`${key}-bar`} {...chartProps} />,
            heatmap: <Heatmap key={`${key}-heatmap`} data={value.map(item => ({ compas: Object.keys(item)[0], value: Object.values(item)[0] as number }))} title={key.replace(/_/g, ' ')} />,
          }[tipo]}
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

      // If the category is 'todos', there is no specific chartConfig, default to 'bar'
      const tipo = chartTypes[key] || chartConfig[categoria]?.[key] || 'bar';

      const dataset = {
        label: key.replace(/_/g, ' '),
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
          <h4 className="text-sm font-semibold mb-1">{key.replace(/_/g, ' ')}</h4>
          <div className="mb-2">
            <label className="text-xs mr-2">Tipo de gráfica:</label>
            <select
              value={tipo}
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
          }[tipo]}
        </div>
      );
    }

    // If not a number, object, or array, do not render chart
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
              <h4 className="section-title">Métricas escalares</h4>
              <div className="scalar-metrics-grid">
                {Object.entries(metricasEscalares).map(([key, value]) => (
                  <div key={key} className="scalar-metric-card">
                    <h5 className="scalar-metric-title">{key.replace(/_/g, ' ')}</h5>
                    <p className="scalar-metric-value">{typeof value === 'number' ? value.toFixed(3) : value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resultado?.metricas && (
            <>
              <div className="charts-list"> {/* Changed from charts-grid to charts-list */}
                {Object.entries(resultado.metricas)
                  .filter(([key]) => categoria === 'todas' || chartConfig[categoria]?.[key] || ['red_interaccion_musical', 'progresiones_armonicas', 'cantidad_total_notas', 'familias_instrumentales', 'partes_detectadas', 'motivos_recurrentes', 'intervalos_predominantes', 'variabilidad_intervalica_por_compas', 'varianza_notas_por_compas', 'dispersion_temporal_por_compas', 'promedio_rango_dinamico_por_compas', 'compacidad_melodica_por_compas', 'repetitividad_motívica_por_compas', 'cantidad_notas_por_compas', 'sincronizacion_entrada_por_compas'].includes(key))
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