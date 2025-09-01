// src/components/charts/ScalarCard.tsx
import React from 'react';

interface ScalarCardProps {
  label: string;
  value: number | string;
  tooltipText?: string;
}

export const ScalarCard: React.FC<ScalarCardProps> = ({ label, value, tooltipText }) => {
  return (
    <div style={{
      border: '1px solid #cbd5e0',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      backgroundColor: '#f7fafc',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      minWidth: '150px',
      textAlign: 'center',
      cursor: tooltipText ? 'help' : 'default',
      position: 'relative',
    }}>
      <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2b6cb0' }}>
        {value}
      </div>
      {tooltipText && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: '#fff',
          padding: '6px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          whiteSpace: 'normal',
          width: '200px',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.3s',
          marginBottom: '6px',
          zIndex: 1000,
        }} className="scalar-tooltip">
          {tooltipText}
        </div>
      )}
      <style>{`
        div[style*="cursor: help"]:hover .scalar-tooltip {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
};