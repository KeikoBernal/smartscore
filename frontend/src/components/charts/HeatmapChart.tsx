// src/components/charts/HeatmapChart.tsx
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface HeatmapChartProps {
  data: number[]; // intensidad por compás
  width?: number;
  height?: number;
  title?: string;
  tooltipText?: string;
  exportId: string;
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  width = 700,
  height = 120,
  title,
  tooltipText,
  exportId,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 20, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const maxVal = d3.max(data) ?? 1;

    const xScale = d3.scaleBand()
      .domain(data.map((_, i) => i.toString()))
      .range([0, innerWidth])
      .padding(0.05);

    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([0, maxVal]);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Eje X con rotación y mejor legibilidad
    const xAxis = d3.axisBottom(xScale)
      .tickValues(xScale.domain().filter((d, i) => i % Math.ceil(data.length / 10) === 0));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '10px');

    // Eje Y oculto (solo para espacio)
    g.append('g')
      .call(d3.axisLeft(d3.scaleLinear().range([innerHeight, 0]).domain([0, 1])).ticks(0))
      .selectAll('text')
      .remove();

    // Rectángulos
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (_, i) => xScale(i.toString()) ?? 0)
      .attr('y', 0)
      .attr('width', xScale.bandwidth())
      .attr('height', innerHeight)
      .attr('fill', d => colorScale(d))
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke', 'black').attr('stroke-width', 1.5);
        tooltip.style('opacity', 1)
          .html(`Valor: ${d.toFixed(3)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke', null);
        tooltip.style('opacity', 0);
      });

    // Título
    if (title) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('font-size', '1rem')
        .text(title);
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
  }, [data, width, height, title]);

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
      <svg ref={svgRef} width={width} height={height} />
      <button onClick={exportImage} style={{ marginTop: '0.3rem', cursor: 'pointer' }}>
        Exportar imagen
      </button>
    </div>
  );
};