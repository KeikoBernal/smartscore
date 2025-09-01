// src/components/charts/BubbleChart.tsx
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface BubbleDataPoint {
  x: number | string;
  y: number;
  r: number;
  label?: string;
}

interface BubbleChartProps {
  data: BubbleDataPoint[];
  width?: number;
  height?: number;
  title?: string;
  tooltipText?: string;
  exportId: string;
}

export const BubbleChart: React.FC<BubbleChartProps> = ({
  data,
  width = 600,
  height = 400,
  title,
  tooltipText,
  exportId,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Escalas
    const xDomain = Array.from(new Set(data.map(d => d.x)));
    const xIsNumber = typeof data[0].x === 'number';

    const xScale = xIsNumber
      ? d3.scaleLinear()
          .domain(d3.extent(data, d => d.x as number) as [number, number])
          .range([0, innerWidth])
          .nice()
      : d3.scalePoint()
          .domain(xDomain as string[])
          .range([0, innerWidth])
          .padding(0.5);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y) ?? 1])
      .range([innerHeight, 0])
      .nice();

    const rScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.r) ?? 1])
      .range([0, 30]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Ejes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-40)')
      .style('text-anchor', 'end');

    g.append('g').call(yAxis);

    // Título
    if (title) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('font-size', '1.2rem')
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

    // Burbujas
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x as any) ?? 0)
      .attr('cy', d => yScale(d.y))
      .attr('r', d => rScale(d.r))
      .attr('fill', (_, i) => colorScale(i.toString()))
      .attr('opacity', 0.7)
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(
          `<strong>${d.label ?? ''}</strong><br/>X: ${d.x}<br/>Y: ${d.y}<br/>Relevancia: ${d.r}`
        )
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });

    return () => {
      tooltip.remove();
    };
  }, [data, width, height, title]);

  // Exportar imagen (igual que heatmap)
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