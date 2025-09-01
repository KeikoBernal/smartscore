// src/components/Tooltip.tsx
import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <span className="tooltip-wrapper" style={{ position: 'relative', cursor: 'help' }}>
      {children}
      <span className="tooltip-text" style={{
        visibility: 'hidden',
        width: '220px',
        backgroundColor: '#333',
        color: '#fff',
        textAlign: 'left',
        borderRadius: '6px',
        padding: '8px',
        position: 'absolute',
        zIndex: 1000,
        bottom: '125%',
        left: '50%',
        marginLeft: '-110px',
        opacity: 0,
        transition: 'opacity 0.3s',
        fontSize: '0.8rem',
        lineHeight: '1.2',
        pointerEvents: 'none',
      }}>
        {text}
      </span>
      <style>{`
        .tooltip-wrapper:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
    </span>
  );
};