// src/components/charts/InstrumentList.tsx
import React, { useState } from 'react';

interface InstrumentListProps {
  data: Record<string, string[]>; // familia -> instrumentos
  title?: string;
  tooltipText?: string;
}

export const InstrumentList: React.FC<InstrumentListProps> = ({ data, title, tooltipText }) => {
  const [openFamilies, setOpenFamilies] = useState<Record<string, boolean>>({});

  const toggleFamily = (family: string) => {
    setOpenFamilies(prev => ({ ...prev, [family]: !prev[family] }));
  };

  return (
    <div style={{
      border: '1px solid #cbd5e0',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      backgroundColor: '#f7fafc',
      maxHeight: '400px',
      overflowY: 'auto',
    }}>
      {title && <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>{title}</h3>}
      {tooltipText && (
        <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '1rem' }}>
          {tooltipText}
        </div>
      )}
      {Object.entries(data).map(([family, instruments]) => (
        <div key={family} style={{ marginBottom: '0.8rem' }}>
          <button
            onClick={() => toggleFamily(family)}
            style={{
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.4rem 0.8rem',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              fontWeight: 'bold',
            }}
            aria-expanded={!!openFamilies[family]}
          >
            {family} ({instruments.length})
          </button>
          {openFamilies[family] && (
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem', listStyleType: 'disc' }}>
              {instruments.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};