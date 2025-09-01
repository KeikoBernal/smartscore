// src/components/charts/BarRadarPieChart.tsx
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface BarRadarPieChartProps {
  data: Record<string, number>;
  initialType?: 'bar' | 'line' | 'radar' | 'pie';
  width?: number;
  height?: number;
  title?: string;
  tooltipText?: string;
  exportId: string;
}

export const BarRadarPieChart: React.FC<BarRadarPieChartProps> = ({
  data,
  initialType = 'bar',
  width = 700,
  height = 400,
  title,
  tooltipText,
  exportId,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'radar' | 'pie'>(initialType);

  // Opciones de tipo de gráfica permitidas para legibilidad
  const allowedTypes = ['bar', 'line', 'pie'] as const;

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (chartType === 'bar' || chartType === 'line') {
      const margin = { top: 40, right: 20, bottom: 70, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const keys = Object.keys(data);
      const values = Object.values(data);

      const xScale = d3.scaleBand()
        .domain(keys)
        .range([0, innerWidth])
        .padding(0.2);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(values) ?? 1])
        .range([innerHeight, 0])
        .nice();

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      // Ejes con rotación y legibilidad mejorada
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .style('font-size', '10px');

      g.append('g').call(d3.axisLeft(yScale));

      if (chartType === 'bar') {
        // Barras
        g.selectAll('rect')
          .data(keys)
          .enter()
          .append('rect')
          .attr('x', d => xScale(d) ?? 0)
          .attr('y', d => yScale(data[d]))
          .attr('width', xScale.bandwidth())
          .attr('height', d => innerHeight - yScale(data[d]))
          .attr('fill', '#4299e1')
          .on('mouseover', function(event, d) {
            d3.select(this).attr('fill', '#2b6cb0');
            tooltip.style('opacity', 1)
              .html(`${d}: ${data[d]}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mouseout', function() {
            d3.select(this).attr('fill', '#4299e1');
            tooltip.style('opacity', 0);
          });
      } else if (chartType === 'line') {
        // Línea
        const line = d3.line<string>()
          .x(d => (xScale(d) ?? 0) + xScale.bandwidth() / 2)
          .y(d => yScale(data[d]));

        g.append('path')
          .datum(keys)
          .attr('fill', 'none')
          .attr('stroke', '#4299e1')
          .attr('stroke-width', 2)
          .attr('d', line);

        // Puntos
        g.selectAll('circle')
          .data(keys)
          .enter()
          .append('circle')
          .attr('cx', d => (xScale(d) ?? 0) + xScale.bandwidth() / 2)
          .attr('cy', d => yScale(data[d]))
          .attr('r', 4)
          .attr('fill', '#4299e1')
          .on('mouseover', function(event, d) {
            tooltip.style('opacity', 1)
              .html(`${d}: ${data[d]}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mouseout', function() {
            tooltip.style('opacity', 0);
          });
      }
    } else if (chartType === 'pie') {
      const radius = Math.min(width, height) / 2 - 40;
      const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

      const pie = d3.pie<number>().value(d => d);
      const dataValues = Object.values(data);
      const dataKeys = Object.keys(data);
      const arcs = pie(dataValues);

      const arc = d3.arc<d3.PieArcDatum<number>>()
        .innerRadius(0)
        .outerRadius(radius);

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      g.selectAll('path')
        .data(arcs)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (_, i) => color(i.toString()))
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .on('mouseover', function(event, d) {
          d3.select(this).attr('opacity', 0.7);
          tooltip.style('opacity', 1)
            .html(`${dataKeys[d.index]}: ${dataValues[d.index]}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
          tooltip.style('opacity', 0);
        });

      // Etiquetas
      g.selectAll('text')
        .data(arcs)
        .enter()
        .append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', '0.8rem')
        .attr('fill', '#000')
        .text((d, i) => dataKeys[i]);

      if (title) {
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', 20)
          .attr('text-anchor', 'middle')
          .attr('font-weight', 'bold')
          .attr('font-size', '1.2rem')
          .text(title);
      }
    }

    // Tooltip div
    const tooltip = d3.select('body').append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('background', '#333')
      .style('color', '#fff')
      .style('padding', '6px 8px')
      .style('border-radius', '4px')
      .style('font-size', '0.8rem')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    return () => {
      tooltip.remove();
    };
  }, [data, chartType, width, height, title]);

  const exportImage = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);

    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgElement.clientWidth;
      canvas.height = svgElement.clientHeight;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${exportId}.png`;
        a.click();
      });
    };
    image.src = url;
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {tooltipText && (
        <div style={{ marginBottom: '0.3rem', fontSize: '0.85rem', color: '#555' }}>
          {tooltipText}
        </div>
      )}
      <div style={{ marginBottom: '0.5rem' }}>
        <label htmlFor={`chart-type-select-${exportId}`} style={{ marginRight: '0.5rem' }}>
          Tipo de gráfica:
        </label>
        <select
          id={`chart-type-select-${exportId}`}
          value={chartType}
          onChange={e => setChartType(e.target.value as typeof chartType)}
          style={{ padding: '0.2rem 0.5rem' }}
        >
          {allowedTypes.map(type => (
            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
          ))}
        </select>
      </div>
      <svg ref={svgRef} width={width} height={height} />
      <button onClick={exportImage} style={{ marginTop: '0.3rem', cursor: 'pointer' }}>
        Exportar imagen
      </button>
    </div>
  );
};