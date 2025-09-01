// src/components/charts/ChordDiagram.tsx
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface ChordDiagramProps {
  matrix: number[][];
  labels: string[];
  width?: number;
  height?: number;
  title?: string;
  tooltipText?: string;
  exportId: string;
}

export const ChordDiagram: React.FC<ChordDiagramProps> = ({
  matrix,
  labels,
  width = 600,
  height = 600,
  title,
  tooltipText,
  exportId,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!matrix || matrix.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const outerRadius = Math.min(width, height) / 2 - 40;
    const innerRadius = outerRadius - 30;

    const chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const ribbon = d3.ribbon()
      .radius(innerRadius);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const chords = chord(matrix);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Grupos
    const group = g.append('g')
      .attr('class', 'groups')
      .selectAll('g')
      .data(chords.groups)
      .enter()
      .append('g');

    group.append('path')
      .attr('fill', d => color(d.index.toString()))
      .attr('stroke', d => d3.rgb(color(d.index.toString())).darker().toString())
      .attr('d', d => arc(d as any));

    group.append('text')
      .each((d: d3.ChordGroup & { angle?: number }) => { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr('dy', '.35em')
      .attr('transform', (d: d3.ChordGroup & { angle?: number }) => {
        const angle = d.angle!;
        const rotate = (angle * 180 / Math.PI - 90);
        const translate = outerRadius + 10;
        return `rotate(${rotate}) translate(${translate})${angle > Math.PI ? ' rotate(180)' : ''}`;
      })
      .attr('text-anchor', (d: d3.ChordGroup & { angle?: number }) => (d.angle! > Math.PI ? 'end' : 'start'))
      .text(d => labels[d.index]);

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

    // No rects needed for chord diagram, so this section is removed.

    // Título
    if (title) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 40 / 2)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('font-size', '1rem')
        .text(title);
    }

    return () => {
      tooltip.remove();
    };
  }, [matrix, labels, width, height, title]);

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