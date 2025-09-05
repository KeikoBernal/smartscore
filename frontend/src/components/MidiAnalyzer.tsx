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
import { obtenerMetricasPorCategoria } from '../services/api'; // Importar la función de la API

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

// Colores brillantes para las gráficas (20 colores)
const CHART_COLORS = [
  '#FF3B30', // rojo brillante
  '#FF9500', // naranja brillante
  '#FFCC00', // amarillo brillante
  '#4CD964', // verde brillante
  '#5AC8FA', // azul claro brillante
  '#007AFF', // azul brillante
  '#5856D6', // índigo brillante
  '#AF52DE', // púrpura brillante
  '#FF2D55', // rosa brillante
  '#FF6B81', // rosa claro brillante
  '#FF9F1C', // naranja dorado
  '#FF5E3A', // rojo anaranjado
  '#FFDB58', // amarillo dorado
  '#32CD32', // verde lima
  '#00CED1', // turquesa
  '#1E90FF', // azul dodger
  '#8A2BE2', // azul violeta
  '#FF69B4', // rosa fuerte
  '#FFA500', // naranja
  '#00FF7F', // verde primavera
];

const CHART_BORDER_COLORS = [
  '#CC2E28', // rojo oscuro
  '#CC7A00', // naranja oscuro
  '#CCAA00', // amarillo oscuro
  '#3DAF4A', // verde oscuro
  '#4AA6D9', // azul claro oscuro
  '#0066CC', // azul oscuro
  '#4B47B3', // índigo oscuro
  '#9B3DB8', // púrpura oscuro
  '#CC2646', // rosa oscuro
  '#CC5A6E', // rosa claro oscuro
  '#CC7A17', // naranja dorado oscuro
  '#CC4A2E', // rojo anaranjado oscuro
  '#CCB84A', // amarillo dorado oscuro
  '#28A428', // verde lima oscuro
  '#009A9A', // turquesa oscuro
  '#1A6FCC', // azul dodger oscuro
  '#6A1B9A', // azul violeta oscuro
  '#CC3B7A', // rosa fuerte oscuro
  '#CC8400', // naranja oscuro
  '#00CC66', // verde primavera oscuro
];

// Tooltips de información (extraídos de informacion.txt)
const TOOLTIPS: Record<string, { title: string; description: string }> = {
  instrumentos_detectados: {
    title: "Instrumentos detectados",
    description: "Una lista de nombres de instrumentos o voces. Por ejemplo, [\"Violín\", \"Piano\", \"Flauta\"] indica las secciones involucradas.",
  },
  cantidad_total_notas: {
    title: "Cantidad total de notas",
    description: "Número total de notas tocadas y distribución por nota. Ejemplo: {\"total\": 500, \"por_nota\": {\"C4\": 40, \"G4\": 55}}; esto indica que el C4 aparece 40 veces, lo que puede señalar su importancia melódica.",
  },
  porcentaje_participacion: {
    title: "Porcentaje de participación",
    description: "Indica qué instrumento toca más notas. Ejemplo: {\"Piano\": 50%, \"Violín\": 50%} quiere decir que ambos instrumentos tienen igual peso en cantidad de notas.",
  },
  balance_dinamico: {
    title: "Balance dinámico",
    description: "Promedio de intensidad (velocidad en MIDI) de notas en cada instrumento, por ejemplo, {\"Piano\": 70, \"Violín\": 85}, sugiere que el violín suena más fuerte en la interpretación.",
  },
  entropia_melodica: {
    title: "Entropía melódica",
    description: "Indica variedad en alturas. Un valor alto (~2-3) implica melodías con muchas notas diferentes, bajo (~0-1) indica líneas simples y repetitivas.",
  },
  intervalos_predominantes: {
    title: "Intervalos predominantes",
    description: "Muestra los saltos más comunes entre notas consecutivas, como \"Segunda mayor\" o \"Tercera menor\", ayudando a entender el carácter melódico.",
  },
  motivos_recurrentes: {
    title: "Motivos recurrentes",
    description: "Listado de grupos de notas que se repiten, con conteo. Por ejemplo, {\"60-62-64\": {\"conteo\": 4, \"notacion\": [\"C4\",\"D4\",\"E4\"]}} indica un motivo Do-Re-Mi que aparece 4 veces, útil para identificar temas.",
  },
  variedad_tonal: {
    title: "Variedad tonal",
    description: "Número de tonalidades detectadas; 1 indica música en una sola tonalidad, mientras más alto refleja modulaciones.",
  },
  entropia_armonica: {
    title: "Entropía armónica",
    description: "Mide la variedad de acordes, valores cercanos a 0 indican progresiones con poco cambio, valores altos indican mayor diversidad.",
  },
  progresiones_armonicas: {
    title: "Progresiones armónicas",
    description: "Muestra qué progresiones de acorde son más frecuentes, por ejemplo \"C:maj - G:maj - Am:maj\": 5 indica que esa secuencia ocurre 5 veces.",
  },
  densidad_armonica: {
    title: "Densidad armonica",
    description: "Número promedio de acordes por compás; un valor de 2 muestra que en promedio hay dos cambios armónicos por compás.",
  },
  entropia_ritmica: {
    title: "Entropía rítmica",
    description: "Alto valor indica ritmos variados (mezcla de negras, corcheas, silencios, etc.), bajo valor indica ritmo uniforme o muy repetitivo.",
  },
  firma_metrica: {
    title: "Firma métrica",
    description: "Distribución de tipos de compases o duraciones de compás. Ejemplo: {4: 32, 3: 8} indica predominio en 4/4 con algunos compases en 3/4.",
  },
  promedio_notas_por_compas: {
    title: "Notas por compás",
    description: "Promedio de notas que ocurren en cada compás; un número alto indica un ritmo más denso.",
  },
  seccion_aurea: {
    title: "Sección áurea",
    description: "Tiempo o compás que representa el 61.8% de la duración total, usualmente punto importante en la forma musical. Ejemplo: para una pieza de 100 s la sección áurea estaría en 61.8 s.",
  },
  compases_estimados: {
    title: "Compases estimados",
    description: "Número aproximado de compases, útil para saber la duración en términos de estructura.",
  },
  contrapunto_activo: {
    title: "Contrapunto activo",
    description: "Cuantifica la diversidad melódica simultánea. Valores altos indican contrapunto con líneas melódicas independientes.",
  },
  red_interaccion_musical: {
    title: "Red de interacción musical",
    description: "Cuántas veces dos instrumentos tocan simultáneamente. Por ejemplo, \"Piano-Violín\": 25 indica mucha interacción entre esas dos líneas.",
  },
  sincronizacion_entrada: {
    title: "Sincronización de entrada",
    description: "Mide cuán sincronizados están los inicios de notas entre instrumentos, valor cercano a 0 indica alta sincronía.",
  },
  // Añadir tooltips para las métricas por compás si se desea
  variabilidad_intervalica_por_compas: {
    title: "Variabilidad Interválica por Compás",
    description: "Mide la variabilidad de los intervalos melódicos dentro de cada compás.",
  },
  varianza_notas_por_compas: {
    title: "Varianza de Notas por Compás",
    description: "Indica la dispersión de la cantidad de notas en cada compás.",
  },
  dispersion_temporal_por_compas: {
    title: "Dispersión Temporal por Compás",
    description: "Mide la dispersión de los eventos musicales en el tiempo dentro de cada compás.",
  },
  promedio_rango_dinamico_por_compas: {
    title: "Promedio de Rango Dinámico por Compás",
    description: "El rango dinámico promedio de las notas en cada compás.",
  },
  compacidad_melodica_por_compas: {
    title: "Compacidad Melódica por Compás",
    description: "Mide cuán 'densas' son las melodías en cada compás.",
  },
  repetitividad_motívica_por_compas: {
    title: "Repetitividad Motívica por Compás",
    description: "Indica la frecuencia de motivos recurrentes en cada compás.",
  },
  cantidad_notas_por_compas: {
    title: "Cantidad de Notas por Compás",
    description: "El número total de notas presentes en cada compás.",
  },
  sincronizacion_entrada_por_compas: {
    title: "Sincronización de Entrada por Compás",
    description: "Mide la sincronización de los inicios de notas entre instrumentos en cada compás.",
  },
};


// /src/components/MidiAnalyzer.tsx

interface ChordChartProps {
  data: Record<string, number>;
  title: string;
  tooltipInfo?: { title: string; description: string };
}

const ChordChart: React.FC<ChordChartProps> = ({ data, title, tooltipInfo }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    const margin = { top: 30, right: 30, bottom: 30, left: 30 };
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const outerRadius = Math.min(width, height) * 0.5 - 30;
    const innerRadius = outerRadius - 20;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${(width + margin.left + margin.right) / 2},${(height + margin.top + margin.bottom) / 2})`);

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

    const color = d3.scaleOrdinal(labels, CHART_COLORS);

    const group = svg.append('g')
      .selectAll('g')
      .data(chord.groups)
      .join('g');

    group.append('path')
      .attr('fill', d => color(labels[d.index]) as string)
      .attr('stroke', d => d3.rgb(color(labels[d.index]) as string).darker() as any)
      .attr('d', arc as any);

    // Eliminamos las etiquetas de texto en el gráfico

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
    <div className="mb-4 chart-container" style={{ overflow: 'visible' }}>
      <h4 className="text-sm font-semibold mb-1 chart-title">
        {title}
        {tooltipInfo && (
          <span className="tooltip-icon" title={tooltipInfo.description}>
            &#9432;
          </span>
        )}
      </h4>
      <svg ref={svgRef} style={{ overflow: 'visible' }}></svg>

      {/* Leyenda mejorada debajo del gráfico */}
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10, gap: 12 }}>
        {Array.from(new Set(Object.keys(data).flatMap(d => d.split('-')))).map((label, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 16,
              height: 16,
              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              borderRadius: 3,
              border: '1px solid #ccc',
            }} />
            <span style={{ color: 'white', fontSize: 12 }}>{label}</span>
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
  tooltipInfo?: { title: string; description: string };
}

const Heatmap: React.FC<HeatmapProps> = ({ data, title, tooltipInfo }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [colorDomain, setColorDomain] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 30, right: 10, bottom: 30, left: 80 };
    const cellSize = 50; // Cuadrados más grandes
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

    // Función para determinar el color del texto basado en el color de fondo
    const getTextColor = (bgColor: string) => {
      const labColor = d3.lab(bgColor);
      return labColor.l > 50 ? '#000' : '#fff'; // Si la luminancia es alta, usa negro; de lo contrario, blanco
    };

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

    // Añadir texto con el valor dentro de cada cuadrado
    cells.append('text')
      .attr('x', cellSize / 2)
      .attr('y', cellSize / 2)
      .attr('dy', '0.35em') // Centrar verticalmente
      .attr('text-anchor', 'middle') // Centrar horizontalmente
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', d => getTextColor(colorScale(d.value))) // Color de texto contrastante
      .text(d => d3.format('.2f')(d.value)); // Formatear el valor a 2 decimales

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
      .attr('fill', 'white') // Asegurar que las etiquetas de fila sean blancas
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
      .style('font-size', '10px')
      .style('fill', 'white'); // Asegurar que el texto de la leyenda sea blanco

  }, [data]);

   return (
    <>
      <h4 className="text-sm font-semibold mb-1 chart-title">
        {title}
        {tooltipInfo && (
          <span className="tooltip-icon" title={tooltipInfo.description}>
            &#9432;
          </span>
        )}
      </h4>
      <svg ref={svgRef}></svg>
    </>
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
  const [analizando, setAnalizando] = useState(false); // Nuevo estado para controlar la visibilidad de los gráficos

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

  const iniciarAnalisis = async () => {
    setAnalizando(true); // Mostrar animación de carga y limpiar gráficos
    const instrumentoFinal = instrumentoPendiente.trim();
    setInstrumentoSeleccionado(instrumentoFinal);
    await analizar(instrumentoFinal);
    setAnalizando(false); // Ocultar animación de carga
  };

  const exportarCSV = () => {
    if (!resultado?.metricas) {
      alert('No hay métricas para exportar.');
      return;
    }

    const metricasParaExportar = resultado.metricas;

    // Función para aplanar el objeto JSON en pares clave-valor CSV
    const flattenObject = (obj: any, prefix = ''): string[] => {
      let lines: string[] = [];
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const newKey = prefix ? `${prefix}.${key}` : key;
          const value = obj[key];

          if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                  // Aplanar objetos dentro de arrays
                  lines = lines.concat(flattenObject(item, `${newKey}[${index}]`));
                } else {
                  lines.push(`${newKey}[${index}],${item}`);
                }
              });
            } else {
              lines = lines.concat(flattenObject(value, newKey));
            }
          } else {
            lines.push(`${newKey},${value}`);
          }
        }
      }
      return lines;
    };

    const filas = flattenObject(metricasParaExportar);
    const csvContent = 'data:text/csv;charset=utf-8,' + filas.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `metricas_${archivo?.name?.replace('.mid', '') || 'export'}.csv`);
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
    const tooltipInfo = TOOLTIPS[key];

    // Red de Interacción Musical (Chord Chart)
    if (
      key === 'red_interaccion_musical' &&
      typeof value === 'object' &&
      value !== null
    ) {
      return <ChordChart key={`chord-${key}`} data={value} title="Red de Interacción Musical" tooltipInfo={tooltipInfo} />;
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
      return <ChordChart key={`chord-${key}`} data={limitedData} title="Progresiones Armónicas (Top 12)" tooltipInfo={tooltipInfo} />;
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
              backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
              borderColor: labels.map((_, i) => CHART_BORDER_COLORS[i % CHART_BORDER_COLORS.length]),
              borderWidth: 1,
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
        <div className="mb-6 chart-container" key={`notas-total-${key}`}>
          <h4 className="text-sm font-semibold mb-1 chart-title">
            Cantidad de Notas por Tono
            {tooltipInfo && (
              <span className="tooltip-icon" title={tooltipInfo.description}>
                &#9432;
              </span>
            )}
          </h4>
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
              backgroundColor: CHART_COLORS[0], // Usar el primer color de la paleta
              borderColor: CHART_BORDER_COLORS[0],
              borderWidth: 1,
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
        <div className="mb-6 chart-container" key={`familias-${key}`}>
          <h4 className="text-sm font-semibold mb-1 chart-title">
            Familias Instrumentales
            {tooltipInfo && (
              <span className="tooltip-icon" title={tooltipInfo.description}>
                &#9432;
              </span>
            )}
          </h4>
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
              backgroundColor: CHART_COLORS[1], // Usar el segundo color de la paleta
              borderColor: CHART_BORDER_COLORS[1],
              borderWidth: 1,
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
        <div className="mb-6 chart-container" key={`partes-${key}`}>
          <h4 className="text-sm font-semibold mb-1 chart-title">
            Notas por Parte Detectada
            {tooltipInfo && (
              <span className="tooltip-icon" title={tooltipInfo.description}>
                &#9432;
              </span>
            )}
          </h4>
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
              backgroundColor: CHART_COLORS[2], // Usar el tercer color de la paleta
              borderColor: CHART_BORDER_COLORS[2],
              borderWidth: 1,
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
        <div className="mb-6 chart-container" key={`motivos-${key}`}>
          <h4 className="text-sm font-semibold mb-1 chart-title">
            Motivos Recurrentes
            {tooltipInfo && (
              <span className="tooltip-icon" title={tooltipInfo.description}>
                &#9432;
              </span>
            )}
          </h4>
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
              backgroundColor: CHART_COLORS[3], // Usar el cuarto color de la paleta
              borderColor: CHART_BORDER_COLORS[3],
              borderWidth: 1,
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
        <div className="mb-6 chart-container" key={`intervalos-${key}`}>
          <h4 className="text-sm font-semibold mb-1 chart-title">
            Intervalos Predominantes
            {tooltipInfo && (
              <span className="tooltip-icon" title={tooltipInfo.description}>
                &#9432;
              </span>
            )}
          </h4>
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
              backgroundColor: CHART_COLORS[4], // Usar un color de la paleta
              borderColor: CHART_BORDER_COLORS[4],
              fill: false,
              tension: 0.1, // Suavizar la línea
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
        <div className="mb-6 chart-container" key={`compas-${key}`}>
          <h4 className="text-sm font-semibold mb-1 chart-title">
            {key.replace(/_/g, ' ')} (Por Compás)
            {tooltipInfo && (
              <span className="tooltip-icon" title={tooltipInfo.description}>
                &#9432;
              </span>
            )}
          </h4>
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
            heatmap: <Heatmap key={`${key}-heatmap`} data={value.map(item => ({ compas: Object.keys(item)[0], value: Object.values(item)[0] as number }))} title={key.replace(/_/g, ' ')} tooltipInfo={tooltipInfo} />,
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
        backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderColor: labels.map((_, i) => CHART_BORDER_COLORS[i % CHART_BORDER_COLORS.length]),
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
        <div className="mb-6 chart-container" key={`obj-${key}`}>
          <h4 className="text-sm font-semibold mb-1 chart-title">
            {key.replace(/_/g, ' ')}
            {tooltipInfo && (
              <span className="tooltip-icon" title={tooltipInfo.description}>
                &#9432;
              </span>
            )}
          </h4>
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
        <h1 className="app-title">Analizador SmartScore✨</h1>
        <div className="header-controls">
          <div className="control-group">
            <label className="control-label">Modo de análisis:</label>
            <select
              value={modo}
              onChange={(e) => setModo(e.target.value as typeof modo)}
              className="control-select glass-effect"
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
                className="control-button glass-effect"
              >
                Seleccionar instrumento
              </button>
              {mostrarSelector && (
                <select
                  value={instrumentoPendiente}
                  onChange={(e) => setInstrumentoPendiente(e.target.value)}
                  className="control-select glass-effect"
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
                className="control-button primary glass-effect"
                disabled={cargando || analizando} // Deshabilitar si ya está cargando o analizando
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
        <main className="main-area glass-effect">
          {analizando && ( // Mostrar animación de carga si analizando es true
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
              Análisis en proceso...
            </div>
          )}

          {!analizando && Object.keys(metricasEscalares).length > 0 && (
            <div className="chart-section">
              <h4 className="section-title">Métricas escalares</h4>
              <div className="scalar-metrics-grid">
                {Object.entries(metricasEscalares).map(([key, value]) => (
                  <div key={key} className="scalar-metric-card glass-effect">
                    <h5 className="scalar-metric-title">
                      {key.replace(/_/g, ' ')}
                      {TOOLTIPS[key] && (
                        <span className="tooltip-icon" title={TOOLTIPS[key].description}>
                          &#9432;
                        </span>
                      )}
                    </h5>
                    <p className="scalar-metric-value">{typeof value === 'number' ? value.toFixed(3) : value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!analizando && resultado?.metricas && (
            <>
              <div className="charts-list"> {/* Changed from charts-grid to charts-list */}
                {Object.entries(resultado.metricas)
                  .filter(([key]) => categoria === 'todas' || chartConfig[categoria]?.[key] || ['red_interaccion_musical', 'progresiones_armonicas', 'cantidad_total_notas', 'familias_instrumentales', 'partes_detectadas', 'motivos_recurrentes', 'intervalos_predominantes', 'variabilidad_intervalica_por_compas', 'varianza_notas_por_compas', 'dispersion_temporal_por_compas', 'promedio_rango_dinamico_por_compas', 'compacidad_melodica_por_compas', 'repetitividad_motívica_por_compas', 'cantidad_notas_por_compas', 'sincronizacion_entrada_por_compas'].includes(key))
                  .map(([key, value]) => renderMetricChart(key, value))}
              </div>

              <button
                onClick={exportarCSV}
                className="export-button glass-effect"
              >
                Exportar métricas como CSV
              </button>
            </>
          )}

          {!analizando && resultado && (
            <pre className="result-json glass-effect">
              {JSON.stringify(resultado, null, 2)}
            </pre>
          )}

          {cargando && !analizando && ( // Mostrar spinner de carga inicial si no estamos en análisis activo
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
        <aside className="sidebar-right glass-effect">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Subir Archivo MIDI</h3>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`drag-drop-area glass-effect ${isDragActive ? 'active' : ''}`}
            >
              <p>Arrastra aquí tu archivo MIDI (.mid)</p>
            </div>

            <div className="file-upload-controls">
              <button
                onClick={() => document.getElementById('midi-upload')?.click()}
                className="upload-button glass-effect"
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
                  className={`category-button glass-effect ${categoria === cat ? 'active' : ''}`}
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