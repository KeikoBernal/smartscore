import React from 'react';
import './styles/global.css';
import MidiAnalyzer from './components/MidiAnalyzer';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1> 🎵 SmartScore: Analizador de Archivos MIDI</h1>
      <MidiAnalyzer />
    </div>
  );
};

export default App;